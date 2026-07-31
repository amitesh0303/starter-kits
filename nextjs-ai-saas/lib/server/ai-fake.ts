/**
 * Deterministic in-memory fake AI adapter for testing.
 * Returns predictable responses based on input for assertion in tests.
 */

import type { AIPort, GenerateParams, GenerateResult } from "./ai";

export class FakeAIAdapter implements AIPort {
  public generations: GenerateResult[] = [];
  public calls: GenerateParams[] = [];

  private responseContent = "This is a fake AI response for testing purposes.";
  private promptTokens = 10;
  private completionTokens = 20;
  private shouldFail = false;
  private failureMessage = "AI generation failed";

  async generateResponse(params: GenerateParams): Promise<GenerateResult> {
    this.calls.push(params);

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    const result: GenerateResult = {
      content: this.responseContent,
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      model: params.model,
    };

    this.generations.push(result);
    return result;
  }

  /**
   * Set the canned response content.
   */
  setResponse(content: string): void {
    this.responseContent = content;
  }

  /**
   * Set the token counts for responses.
   */
  setTokenCounts(prompt: number, completion: number): void {
    this.promptTokens = prompt;
    this.completionTokens = completion;
  }

  /**
   * Configure the adapter to throw on the next call.
   */
  setFailure(shouldFail: boolean, message?: string): void {
    this.shouldFail = shouldFail;
    if (message) this.failureMessage = message;
  }

  /**
   * Reset all state.
   */
  reset(): void {
    this.generations = [];
    this.calls = [];
    this.responseContent = "This is a fake AI response for testing purposes.";
    this.promptTokens = 10;
    this.completionTokens = 20;
    this.shouldFail = false;
    this.failureMessage = "AI generation failed";
  }
}
