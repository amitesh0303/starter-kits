/**
 * AI port: OpenAI-compatible adapter for text generation.
 * Server-only - never expose API keys to the client bundle.
 */

import { AIError, sanitizeProviderError } from "./errors";

// --- AI Port Interface ---

export interface GenerateParams {
  model: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateResult {
  content: string;
  promptTokens: number;
  completionTokens: number;
  model: string;
}

export interface AIPort {
  generateResponse(params: GenerateParams): Promise<GenerateResult>;
}

// --- OpenAI Adapter ---

export class OpenAIAdapter implements AIPort {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateResponse(params: GenerateParams): Promise<GenerateResult> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: params.model,
          messages: params.messages,
          max_tokens: params.maxTokens ?? 1024,
          temperature: params.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        throw new AIError("AI provider returned an error");
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      if (!choice) {
        throw new AIError("No response from AI provider");
      }

      return {
        content: choice.message?.content ?? "",
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        model: data.model ?? params.model,
      };
    } catch (error) {
      if (error instanceof AIError) throw error;
      throw sanitizeProviderError(error, "AI generation failed");
    }
  }
}
