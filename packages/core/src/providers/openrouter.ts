/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  Content,
  Part,
} from '@google/genai';
import { ContentGenerator } from '../core/contentGenerator.js';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: string }>;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface OpenRouterChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface OpenRouterResponse {
  id: string;
  choices: OpenRouterChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterContentGenerator implements ContentGenerator {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl || OPENROUTER_BASE_URL;
  }

  async generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse> {
    const openrouterRequest = this.convertToOpenRouterRequest(request);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/cbwinslow/gemini-cli',
        'X-Title': 'Gemini CLI',
      },
      body: JSON.stringify(openrouterRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();
    return this.convertToGenerateContentResponse(data);
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const openrouterRequest = this.convertToOpenRouterRequest(request);
    openrouterRequest.stream = true;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/cbwinslow/gemini-cli',
        'X-Title': 'Gemini CLI',
      },
      body: JSON.stringify(openrouterRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const generator = this.createStreamGenerator(response.body);
    return generator;
  }

  private async *createStreamGenerator(
    body: ReadableStream<Uint8Array>,
  ): AsyncGenerator<GenerateContentResponse> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                yield this.convertStreamChunkToResponse(parsed);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async countTokens(
    request: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    // OpenRouter doesn't have a dedicated token counting endpoint
    // We'll estimate based on content length (rough approximation)
    const text = this.extractTextFromContents(request.contents);
    const estimatedTokens = Math.ceil(text.length / 4);
    
    return {
      totalTokens: estimatedTokens,
    };
  }

  async embedContent(
    _request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    throw new Error('OpenRouter does not support embedContent');
  }

  private convertToOpenRouterRequest(
    request: GenerateContentParameters,
  ): OpenRouterRequest {
    const messages: OpenRouterMessage[] = [];

    // Add system instruction if present
    if (request.config?.systemInstruction) {
      const systemContent = this.extractContent(request.config.systemInstruction);
      messages.push({
        role: 'system',
        content: systemContent,
      });
    }

    // Convert contents to messages
    const contentsArray = Array.isArray(request.contents) ? request.contents : [request.contents];
    for (const content of contentsArray) {
      if (typeof content === 'string') {
        messages.push({
          role: 'user',
          content,
        });
      } else if (content && typeof content === 'object') {
        const contentObj = content as Content;
        const role = contentObj.role === 'model' ? 'assistant' : (contentObj.role as 'user' | 'system');
        const messageContent = this.convertParts(contentObj.parts || []);
        
        messages.push({
          role,
          content: messageContent,
        });
      }
    }

    return {
      model: this.model,
      messages,
      temperature: request.config?.temperature,
      max_tokens: request.config?.maxOutputTokens,
      top_p: request.config?.topP,
    };
  }

  private extractContent(content: unknown): string {
    if (typeof content === 'string') {
      return content;
    }
    if (content && typeof content === 'object' && 'parts' in content) {
      const parts = (content as Content).parts || [];
      return this.extractTextFromParts(parts);
    }
    return '';
  }

  private convertParts(parts: Part[]): string | Array<{ type: string; text?: string; image_url?: string }> {
    // For simplicity, convert to text. More complex implementations could handle images
    return this.extractTextFromParts(parts);
  }

  private extractTextFromParts(parts: Part[]): string {
    return parts
      .map(part => {
        if ('text' in part && part.text) {
          return part.text;
        }
        if ('functionCall' in part) {
          return `[Function Call: ${part.functionCall?.name}]`;
        }
        if ('functionResponse' in part) {
          return `[Function Response]`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  private extractTextFromContents(contents: unknown): string {
    if (Array.isArray(contents)) {
      return contents
        .map(content => {
          if (typeof content === 'object' && content && 'parts' in content) {
            return this.extractTextFromParts((content as Content).parts || []);
          }
          return '';
        })
        .join('\n');
    }
    if (contents && typeof contents === 'object' && 'parts' in contents) {
      return this.extractTextFromParts((contents as Content).parts || []);
    }
    return '';
  }

  private convertToGenerateContentResponse(
    data: OpenRouterResponse,
  ): GenerateContentResponse {
    const response = new GenerateContentResponse();
    
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      response.candidates = [
        {
          content: {
            parts: [{ text: choice.message.content }],
            role: 'model',
          },
          finishReason: this.mapFinishReason(choice.finish_reason) as never,
          index: 0,
        },
      ];
    }

    if (data.usage) {
      response.usageMetadata = {
        promptTokenCount: data.usage.prompt_tokens,
        candidatesTokenCount: data.usage.completion_tokens,
        totalTokenCount: data.usage.total_tokens,
      };
    }

    return response;
  }

  private convertStreamChunkToResponse(chunk: {
    choices: Array<{ delta: { content?: string } }>;
  }): GenerateContentResponse {
    const response = new GenerateContentResponse();
    
    if (chunk.choices && chunk.choices.length > 0) {
      const content = chunk.choices[0].delta.content || '';
      response.candidates = [
        {
          content: {
            parts: [{ text: content }],
            role: 'model',
          },
          index: 0,
        },
      ];
    }

    return response;
  }

  private mapFinishReason(reason: string): 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER' {
    const mapping: Record<string, 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER'> = {
      'stop': 'STOP',
      'length': 'MAX_TOKENS',
      'content_filter': 'SAFETY',
      'function_call': 'STOP',
    };
    return mapping[reason] || 'OTHER';
  }
}
