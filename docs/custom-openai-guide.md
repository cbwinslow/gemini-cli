# Custom OpenAI Provider - Visual Guide

## Updated Authentication Dialog

When users run Gemini CLI and select an authentication method, they now see **5 options**:

```
┌──────────────────────────────────────────────┐
│ Select Auth Method                           │
├──────────────────────────────────────────────┤
│                                              │
│  ○ Login with Google                         │
│  ○ Gemini API Key (AI Studio)                │
│  ○ Vertex AI                                 │
│  ○ OpenRouter                                │
│  ● Custom OpenAI Provider                    │
│                                              │
└──────────────────────────────────────────────┘
```

## Configuration Examples

### Example 1: Ollama (Local LLMs)

```json
{
  "selectedAuthType": "custom-openai",
  "customOpenAIConfig": {
    "apiKey": "ollama",
    "baseUrl": "http://localhost:11434/v1",
    "model": "llama3.1:70b"
  }
}
```

### Example 2: LM Studio

```json
{
  "selectedAuthType": "custom-openai",
  "customOpenAIConfig": {
    "apiKey": "lm-studio",
    "baseUrl": "http://localhost:1234/v1",
    "model": "local-model"
  }
}
```

### Example 3: Anyscale Endpoints

```json
{
  "selectedAuthType": "custom-openai",
  "customOpenAIConfig": {
    "apiKey": "your-anyscale-api-key",
    "baseUrl": "https://api.endpoints.anyscale.com/v1",
    "model": "meta-llama/Llama-3-70b-chat-hf"
  }
}
```

### Example 4: Custom Deployment

```json
{
  "selectedAuthType": "custom-openai",
  "customOpenAIConfig": {
    "apiKey": "your-custom-api-key",
    "baseUrl": "https://your-company.com/api/v1",
    "model": "your-model-name"
  }
}
```

## How It Works

1. **User selects "Custom OpenAI Provider"** from the auth dialog
2. **No environment variables needed** - everything configured in settings.json
3. **The system validates** that the custom config exists in settings
4. **Reuses OpenRouter provider** under the hood (since OpenAI API is the standard)
5. **Model can be overridden** via CLI flag: `gemini --model different-model`

## Benefits

✅ **Flexibility** - Connect to any OpenAI-compatible API
✅ **Privacy** - Run models locally with Ollama/LM Studio
✅ **Cost Control** - Use self-hosted or cheaper providers
✅ **Simple Setup** - Just edit settings.json
✅ **Model Choice** - Use any model your provider supports

## Workflow

1. Install and run Ollama (or your chosen provider)
2. Configure `~/.gemini/settings.json` with the details
3. Run `gemini` and select "Custom OpenAI Provider"
4. Start chatting with your custom model!

## Technical Details

- Uses the same `OpenRouterContentGenerator` class (OpenAI-compatible format)
- Supports streaming and synchronous generation
- Token counting via estimation
- Full error handling and validation
- Command-line model override supported
