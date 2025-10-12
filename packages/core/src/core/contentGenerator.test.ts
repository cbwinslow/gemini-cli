/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import { createContentGenerator, AuthType } from './contentGenerator.js';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import { GoogleGenAI } from '@google/genai';
import { OpenRouterContentGenerator } from '../providers/openrouter.js';

vi.mock('../code_assist/codeAssist.js');
vi.mock('@google/genai');
vi.mock('../providers/openrouter.js');

describe('contentGenerator', () => {
  it('should create a CodeAssistContentGenerator', async () => {
    const mockGenerator = {} as unknown;
    vi.mocked(createCodeAssistContentGenerator).mockResolvedValue(
      mockGenerator as never,
    );
    const generator = await createContentGenerator({
      model: 'test-model',
      authType: AuthType.LOGIN_WITH_GOOGLE_PERSONAL,
    });
    expect(createCodeAssistContentGenerator).toHaveBeenCalled();
    expect(generator).toBe(mockGenerator);
  });

  it('should create a GoogleGenAI content generator', async () => {
    const mockGenerator = {
      models: {},
    } as unknown;
    vi.mocked(GoogleGenAI).mockImplementation(() => mockGenerator as never);
    const generator = await createContentGenerator({
      model: 'test-model',
      apiKey: 'test-api-key',
      authType: AuthType.USE_GEMINI,
    });
    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      vertexai: undefined,
      httpOptions: {
        headers: {
          'User-Agent': expect.any(String),
        },
      },
    });
    expect(generator).toBe((mockGenerator as GoogleGenAI).models);
  });

  it('should create an OpenRouter content generator', async () => {
    const mockGenerator = {} as unknown;
    vi.mocked(OpenRouterContentGenerator).mockImplementation(
      () => mockGenerator as never,
    );
    const generator = await createContentGenerator({
      model: 'anthropic/claude-3-opus',
      apiKey: 'test-openrouter-key',
      authType: AuthType.USE_OPENROUTER,
    });
    expect(OpenRouterContentGenerator).toHaveBeenCalledWith(
      'test-openrouter-key',
      'anthropic/claude-3-opus',
      undefined,
    );
    expect(generator).toBe(mockGenerator);
  });

  it('should throw error for OpenRouter without API key', async () => {
    await expect(
      createContentGenerator({
        model: 'anthropic/claude-3-opus',
        authType: AuthType.USE_OPENROUTER,
      }),
    ).rejects.toThrow('OpenRouter API key is required');
  });
});
