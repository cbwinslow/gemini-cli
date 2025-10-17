# Authentication Setup

The Gemini CLI requires you to authenticate with AI services. On initial startup you'll need to configure **one** of the following authentication methods:

1.  **Login with Google (Gemini Code Assist):**
    - Use this option to log in with your google account.
    - During initial startup, Gemini CLI will direct you to a webpage for authentication. Once authenticated, your credentials will be cached locally so the web login can be skipped on subsequent runs.
    - Note that the web login must be done in a browser that can communicate with the machine Gemini CLI is being run from. (Specifically, the browser will be redirected to a localhost url that Gemini CLI will be listening on).
    - <a id="workspace-gca">Users may have to specify a GOOGLE_CLOUD_PROJECT if:</a>
      1. You have a Google Workspace account. Google Workspace is a paid service for businesses and organizations that provides a suite of productivity tools, including a custom email domain (e.g. your-name@your-company.com), enhanced security features, and administrative controls. These accounts are often managed by an employer or school.
      1. You have received a free Code Assist license through the [Google Developer Program](https://developers.google.com/program/plans-and-pricing) (including qualified Google Developer Experts)
      1. You have been assigned a license to a current Gemini Code Assist standard or enterprise subscription.
      1. You are using the product outside the [supported regions](https://developers.google.com/gemini-code-assist/resources/available-locations) for free individual usage.>
      1. You are a Google account holder under the age of 18
      - If you fall into one of these categories, you must first configure a Google Cloud Project Id to use, [enable the Gemini for Cloud API](https://cloud.google.com/gemini/docs/discover/set-up-gemini#enable-api) and [configure access permissions](https://cloud.google.com/gemini/docs/discover/set-up-gemini#grant-iam).

      You can temporarily set the environment variable in your current shell session using the following command:

      ```bash
      export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
      ```
      - For repeated use, you can add the environment variable to your `.env` file (located in the project directory or user home directory) or your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example, the following command adds the environment variable to a `~/.bashrc` file:

      ```bash
      echo 'export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"' >> ~/.bashrc
      source ~/.bashrc
      ```

2.  **<a id="gemini-api-key"></a>Gemini API key:**
    - Obtain your API key from Google AI Studio: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
    - Set the `GEMINI_API_KEY` environment variable. In the following methods, replace `YOUR_GEMINI_API_KEY` with the API key you obtained from Google AI Studio:
      - You can temporarily set the environment variable in your current shell session using the following command:
        ```bash
        export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
        ```
      - For repeated use, you can add the environment variable to your `.env` file (located in the project directory or user home directory) or your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example, the following command adds the environment variable to a `~/.bashrc` file:
        ```bash
        echo 'export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"' >> ~/.bashrc
        source ~/.bashrc
        ```

3.  **Vertex AI:**
    - If not using express mode:
      - Ensure you have a Google Cloud project and have enabled the Vertex AI API.
      - Set up Application Default Credentials (ADC), using the following command:
        ```bash
        gcloud auth application-default login
        ```
        For more information, see [Set up Application Default Credentials for Google Cloud](https://cloud.google.com/docs/authentication/provide-credentials-adc).
      - Set the `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, and `GOOGLE_GENAI_USE_VERTEXAI` environment variables. In the following methods, replace `YOUR_PROJECT_ID` and `YOUR_PROJECT_LOCATION` with the relevant values for your project:
        - You can temporarily set these environment variables in your current shell session using the following commands:
          ```bash
          export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
          export GOOGLE_CLOUD_LOCATION="YOUR_PROJECT_LOCATION" # e.g., us-central1
          export GOOGLE_GENAI_USE_VERTEXAI=true
          ```
        - For repeated use, you can add the environment variables to your `.env` file (located in the project directory or user home directory) or your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example, the following commands add the environment variables to a `~/.bashrc` file:
          ```bash
          echo 'export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"' >> ~/.bashrc
          echo 'export GOOGLE_CLOUD_LOCATION="YOUR_PROJECT_LOCATION"' >> ~/.bashrc
          echo 'export GOOGLE_GENAI_USE_VERTEXAI=true' >> ~/.bashrc
          source ~/.bashrc
          ```
    - If using express mode:
      - Set the `GOOGLE_API_KEY` environment variable. In the following methods, replace `YOUR_GOOGLE_API_KEY` with your Vertex AI API key provided by express mode:
        - You can temporarily set these environment variables in your current shell session using the following commands:
          ```bash
          export GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
          export GOOGLE_GENAI_USE_VERTEXAI=true
          ```
        - For repeated use, you can add the environment variables to your `.env` file (located in the project directory or user home directory) or your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example, the following commands add the environment variables to a `~/.bashrc` file:
          ```bash
          echo 'export GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"' >> ~/.bashrc
          echo 'export GOOGLE_GENAI_USE_VERTEXAI=true' >> ~/.bashrc
          source ~/.bashrc
          ```

4.  **<a id="openrouter"></a>OpenRouter:**
    - OpenRouter provides access to multiple LLM providers through a unified API, including models from Anthropic (Claude), OpenAI (GPT), Meta (Llama), Google (Gemini), and many others.
    - To use OpenRouter:
      - Create an account at [https://openrouter.ai/](https://openrouter.ai/)
      - Obtain your API key from [https://openrouter.ai/keys](https://openrouter.ai/keys)
      - Set the `OPENROUTER_API_KEY` environment variable. In the following methods, replace `YOUR_OPENROUTER_API_KEY` with your OpenRouter API key:
        - You can temporarily set the environment variable in your current shell session using the following command:
          ```bash
          export OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"
          ```
        - For repeated use, you can add the environment variable to your `.env` file (located in the project directory or user home directory) or your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example:
          ```bash
          echo 'export OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"' >> ~/.bashrc
          source ~/.bashrc
          ```
    - **Selecting a Model:**
      - OpenRouter provides access to many different models. You can specify which model to use in your settings file (`~/.gemini/settings.json`):
        ```json
        {
          "selectedAuthType": "openrouter",
          "openrouterModel": "anthropic/claude-3.5-sonnet"
        }
        ```
      - Popular model options include:
        - `anthropic/claude-3.5-sonnet` - Latest Claude model, excellent for coding
        - `anthropic/claude-3-opus` - Most capable Claude model
        - `openai/gpt-4-turbo` - Latest GPT-4 Turbo
        - `google/gemini-pro-1.5` - Google's Gemini Pro
        - `meta-llama/llama-3.1-70b-instruct` - Meta's Llama 3.1
      - See the full list of available models at [https://openrouter.ai/models](https://openrouter.ai/models)
      - If no model is specified in settings, the default is `anthropic/claude-3.5-sonnet`
    - You can also specify the model via the command line:
      ```bash
      gemini --model anthropic/claude-3-opus
      ```

5.  **<a id="custom-openai"></a>Custom OpenAI-Compatible Provider:**
    - Use this option to connect to any OpenAI-compatible API endpoint (e.g., local LLMs, custom deployments, or other providers).
    - Configure in your settings file (`~/.gemini/settings.json`):
      ```json
      {
        "selectedAuthType": "custom-openai",
        "customOpenAIConfig": {
          "apiKey": "your-api-key-here",
          "baseUrl": "https://api.your-provider.com/v1",
          "model": "your-model-name"
        }
      }
      ```
    - **Configuration Options:**
      - `apiKey`: Your API key for the custom provider
      - `baseUrl`: The base URL of the OpenAI-compatible API endpoint
      - `model`: The model name to use (e.g., `gpt-4`, `llama-3-70b`, etc.)
    - **Examples:**
      - **Local Ollama**: 
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
      - **LM Studio**:
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
      - **Anyscale Endpoints**:
        ```json
        {
          "selectedAuthType": "custom-openai",
          "customOpenAIConfig": {
            "apiKey": "your-anyscale-key",
            "baseUrl": "https://api.endpoints.anyscale.com/v1",
            "model": "meta-llama/Llama-3-70b-chat-hf"
          }
        }
        ```
    - You can override the model via command line:
      ```bash
      gemini --model different-model-name
      ```
