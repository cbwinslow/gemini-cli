# OpenRouter UI Integration

## Authentication Dialog

When users run Gemini CLI and need to select an authentication method, they will now see:

```
┌──────────────────────────────────────────────┐
│ Select Auth Method                           │
├──────────────────────────────────────────────┤
│                                              │
│  ○ Login with Google                         │
│  ○ Gemini API Key (AI Studio)                │
│  ○ Vertex AI                                 │
│  ● OpenRouter                                │
│                                              │
└──────────────────────────────────────────────┘
```

Users can navigate with arrow keys and select with Enter.

## Error Message Examples

### Missing API Key
If user selects OpenRouter without setting `OPENROUTER_API_KEY`:

```
┌──────────────────────────────────────────────┐
│ Select Auth Method                           │
├──────────────────────────────────────────────┤
│                                              │
│  ○ Login with Google                         │
│  ○ Gemini API Key (AI Studio)                │
│  ○ Vertex AI                                 │
│  ● OpenRouter                                │
│                                              │
│  ⚠ OPENROUTER_API_KEY environment variable   │
│    not found. Add that to your .env and try  │
│    again, no reload needed!                  │
└──────────────────────────────────────────────┘
```

## Settings File Integration

Users can configure OpenRouter in `~/.gemini/settings.json`:

```json
{
  "selectedAuthType": "openrouter",
  "openrouterModel": "anthropic/claude-3.5-sonnet",
  "theme": "default-dark"
}
```

## Command Line Usage

Users can override the model via command line:

```bash
# Use default model from settings
gemini

# Override with specific model
gemini --model anthropic/claude-3-opus

# Use with inline prompt
gemini --model meta-llama/llama-3.1-70b-instruct -p "Explain quantum computing"
```

## Workflow Example

1. User runs `gemini` for the first time
2. Authentication dialog appears showing 4 options including OpenRouter
3. User selects OpenRouter
4. If API key is missing, clear error message appears
5. User adds `OPENROUTER_API_KEY` to `.env` file
6. User runs `gemini` again
7. Connection succeeds, ready to use!

## Model Selection Hierarchy

The CLI determines which model to use in this order:

1. Command line flag: `--model anthropic/claude-3-opus`
2. Settings file: `"openrouterModel": "anthropic/claude-3.5-sonnet"`
3. Default fallback: `anthropic/claude-3.5-sonnet`

This allows flexibility while providing sensible defaults.
