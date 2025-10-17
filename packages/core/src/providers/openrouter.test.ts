/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterContentGenerator } from './openrouter.js';
import { GenerateContentResponse } from '@google/genai';

describe('OpenRouterContentGenerator', () => {
  let generator: OpenRouterContentGenerator;
  const mockApiKey = 'test-api-key';
  const mockModel = 'anthropic/claude-3-opus';

  beforeEach(() => {
    generator = new OpenRouterContentGenerator(mockApiKey, mockModel);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateContent', () => {
    it('should successfully generate content', async () => {
      const mockResponse = {
        id: 'test-id',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello, world!',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generator.generateContent({
        model: mockModel,
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello' }],
          },
        ],
      });

      expect(result).toBeInstanceOf(GenerateContentResponse);
      expect(result.candidates).toHaveLength(1);
      expect(result.candidates?.[0]?.content?.parts?.[0]).toEqual({
        text: 'Hello, world!',
      });
      expect(result.usageMetadata?.totalTokenCount).toBe(15);
    });

    it('should handle API errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(
        generator.generateContent({
          model: mockModel,
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Hello' }],
            },
          ],
        }),
      ).rejects.toThrow('OpenRouter API error: 401 - Unauthorized');
    });

    it('should include system instruction in request', async () => {
      const mockResponse = {
        id: 'test-id',
        choices: [
          {
            message: { role: 'assistant', content: 'Response' },
            finish_reason: 'stop',
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await generator.generateContent({
        model: mockModel,
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello' }],
          },
        ],
        config: {
          systemInstruction: {
            parts: [{ text: 'You are a helpful assistant' }],
          },
        },
      });

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.messages[0].role).toBe('system');
      expect(body.messages[0].content).toBe('You are a helpful assistant');
    });

    it('should pass generation config parameters', async () => {
      const mockResponse = {
        id: 'test-id',
        choices: [
          {
            message: { role: 'assistant', content: 'Response' },
            finish_reason: 'stop',
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await generator.generateContent({
        model: mockModel,
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello' }],
          },
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.9,
        },
      });

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.temperature).toBe(0.7);
      expect(body.max_tokens).toBe(1000);
      expect(body.top_p).toBe(0.9);
    });
  });

  describe('generateContentStream', () => {
    it('should handle streaming responses', async () => {
      const streamData = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n',
        'data: [DONE]\n',
      ];

      const mockReadableStream = new ReadableStream({
        start(controller) {
          for (const chunk of streamData) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        },
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: mockReadableStream,
      });

      const chunks: GenerateContentResponse[] = [];
      const stream = await generator.generateContentStream({
        model: mockModel,
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello' }],
          },
        ],
      });
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0]?.candidates?.[0]?.content?.parts?.[0]).toEqual({
        text: 'Hello',
      });
      expect(chunks[1]?.candidates?.[0]?.content?.parts?.[0]).toEqual({
        text: ' world',
      });
    });
  });

  describe('countTokens', () => {
    it('should estimate token count', async () => {
      const result = await generator.countTokens({
        model: mockModel,
        contents: [
          {
            role: 'user',
            parts: [{ text: 'This is a test message' }],
          },
        ],
      });

      expect(result.totalTokens).toBeGreaterThan(0);
    });
  });

  describe('embedContent', () => {
    it('should throw error for unsupported operation', async () => {
      await expect(
        generator.embedContent({
          model: 'test-model',
          contents: [
            {
              parts: [{ text: 'test' }],
            },
          ],
        }),
      ).rejects.toThrow('OpenRouter does not support content embedding');
    });
  });
});
