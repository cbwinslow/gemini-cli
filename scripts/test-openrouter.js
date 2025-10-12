#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Manual test script for OpenRouter integration
 * 
 * Usage:
 *   export OPENROUTER_API_KEY="your-key-here"
 *   node scripts/test-openrouter.js
 */

import { OpenRouterContentGenerator } from '../packages/core/src/providers/openrouter.js';

async function testOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('Error: OPENROUTER_API_KEY environment variable not set');
    console.error('Usage: export OPENROUTER_API_KEY="your-key-here"');
    process.exit(1);
  }

  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
  console.log(`Testing OpenRouter with model: ${model}`);
  
  const generator = new OpenRouterContentGenerator(apiKey, model);

  console.log('\n=== Test 1: Simple generation ===');
  try {
    const result = await generator.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Say "Hello, OpenRouter!" and nothing else.' }],
        },
      ],
    });

    console.log('Success! Response:', result.candidates?.[0]?.content?.parts?.[0]?.text);
    console.log('Usage:', result.usageMetadata);
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }

  console.log('\n=== Test 2: Streaming generation ===');
  try {
    const stream = await generator.generateContentStream({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Count from 1 to 5, one number per line.' }],
        },
      ],
    });

    let fullText = '';
    for await (const chunk of stream) {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
      fullText += text;
      process.stdout.write(text);
    }
    console.log('\n\nFull response:', fullText);
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }

  console.log('\n=== Test 3: Token counting ===');
  try {
    const result = await generator.countTokens({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: 'This is a test message for token counting.' }],
        },
      ],
    });

    console.log('Estimated tokens:', result.totalTokens);
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }

  console.log('\n✅ All tests passed!');
}

testOpenRouter().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
