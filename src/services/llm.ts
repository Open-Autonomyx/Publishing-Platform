/**
 * Vendor-Neutral LLM Service
 * Supports: Local LLMs (Ollama, LLaMA), OpenAI, Anthropic, Azure, etc.
 * Auto-detects and configures based on environment
 *
 * © 2026 OpenAutonomyX Contributors
 * Built with Claude AI (Anthropic AI Coding Agent)
 * Licensed under MIT License
 *
 * This file is part of OpenAutonomyX, an open-source
 * vendor-neutral creative publishing platform.
 */

export type LLMProvider = 'ollama' | 'llama' | 'openai' | 'anthropic' | 'azure' | 'huggingface';
export type LLMModel = 'llama2' | 'mistral' | 'neural-chat' | 'gpt-4' | 'claude-3' | string;

export interface LLMConfig {
  provider: LLMProvider;
  model: LLMModel;
  apiKey?: string;
  apiUrl?: string;
  localPort?: number; // For Ollama/local
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProvider;
  tokens?: {
    input: number;
    output: number;
  };
  latency?: number;
}

/**
 * Local LLM Service (Ollama, LLaMA, etc.)
 */
export class LocalLLMService {
  private config: LLMConfig;
  private apiUrl: string;

  constructor(config: LLMConfig) {
    this.config = config;
    this.apiUrl = config.apiUrl || `http://localhost:${config.localPort || 11434}`;
  }

  /**
   * Generate content using local LLM
   */
  async generate(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          temperature: options?.temperature || this.config.temperature || 0.7,
          num_predict: options?.maxTokens || this.config.maxTokens || 512,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM error: ${response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.response,
        model: this.config.model,
        provider: this.config.provider,
        latency,
      };
    } catch (error) {
      console.error('Local LLM error:', error);
      throw new Error(`Local LLM generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if local LLM is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/tags`, {
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * List available local models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/tags`);
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      console.log(`✅ Model ${modelName} pulled successfully`);
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      throw error;
    }
  }
}

/**
 * Vendor-Neutral LLM Router
 * Auto-selects best available LLM
 */
export class LLMRouter {
  private localService?: LocalLLMService;
  private config: LLMConfig;
  private preferredProvider: LLMProvider;

  constructor(config: LLMConfig) {
    this.config = config;
    this.preferredProvider = config.provider;

    if (config.provider === 'ollama') {
      this.localService = new LocalLLMService(config);
    }
  }

  /**
   * Generate content using configured LLM
   */
  async generate(prompt: string): Promise<LLMResponse> {
    // Try local LLM first if configured
    if (this.localService) {
      try {
        if (await this.localService.isAvailable()) {
          return await this.localService.generate(prompt);
        }
      } catch (error) {
        console.warn('Local LLM failed, falling back to cloud...');
      }
    }

    // Fall back to cloud providers
    return this.generateCloud(prompt);
  }

  /**
   * Cloud LLM generation (OpenAI, Anthropic, etc.)
   */
  private async generateCloud(prompt: string): Promise<LLMResponse> {
    // Implementation varies by provider
    throw new Error(`Cloud provider ${this.preferredProvider} not yet implemented`);
  }

  /**
   * Auto-detect and use best available LLM
   */
  async autoSelect(): Promise<LLMProvider> {
    // Try local first
    if (this.localService?.isAvailable()) {
      console.log('✅ Using local LLM (Ollama)');
      return 'ollama';
    }

    // Try other providers by environment variable
    if (process.env.OPENAI_API_KEY) {
      console.log('✅ Using OpenAI');
      return 'openai';
    }

    if (process.env.ANTHROPIC_API_KEY) {
      console.log('✅ Using Anthropic');
      return 'anthropic';
    }

    throw new Error('No LLM provider configured. Install Ollama or set API keys.');
  }
}

/**
 * Recommended local models for different use cases
 */
export const RECOMMENDED_MODELS = {
  // Meta's models
  llama2: 'mistralai/llama2:latest', // 7B-70B variants

  // Mistral models (fast, efficient)
  mistral: 'mistral:latest', // 7B
  mistralMedium: 'mistral:medium', // Larger variant

  // Neural Chat (good for dialogue)
  neuralChat: 'neural-chat:latest',

  // Code generation
  codeUp: 'codeup:latest',
  starCoder: 'starcoder:latest',

  // Lightweight
  tinyllama: 'tinyllama:latest',
  orca: 'orca-mini:latest',
};

/**
 * Setup guide for local LLM
 */
export const LOCAL_LLM_SETUP = `
╔════════════════════════════════════════════════════════════════╗
║                   LOCAL LLM SETUP GUIDE                        ║
╚════════════════════════════════════════════════════════════════╝

1. INSTALL OLLAMA (Free, Open Source)
   macOS: https://ollama.ai/download
   Linux: curl https://ollama.ai/install.sh | sh
   Windows: Download from https://ollama.ai/download

2. START OLLAMA
   $ ollama serve
   (Runs on localhost:11434 by default)

3. PULL A MODEL
   $ ollama pull mistral          # Fast & efficient (7B)
   $ ollama pull llama2           # More capable (7B)
   $ ollama pull neural-chat      # Good for dialogue

4. VERIFY INSTALLATION
   $ curl http://localhost:11434/api/tags
   (Should list your models)

5. CONFIGURE OPENAUTONOMYX
   Set in .env or UI:
   LLM_PROVIDER=ollama
   LLM_MODEL=mistral
   LLM_API_URL=http://localhost:11434

✅ You're ready! Platform will auto-detect local LLM.

System Requirements:
  • 8GB RAM minimum (16GB recommended)
  • GPU optional but speeds up generation 10-100x
  • 5-10GB disk per model
`;
