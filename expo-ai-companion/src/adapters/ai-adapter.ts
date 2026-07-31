export interface AIResponse { content: string; tokensUsed: number; }
export interface AIAdapter {
  sendMessage(messages: Array<{ role: string; content: string }>): Promise<AIResponse>;
  streamMessage(messages: Array<{ role: string; content: string }>, onChunk: (chunk: string) => void): Promise<AIResponse>;
}

export function createFakeAIAdapter(): AIAdapter {
  return {
    async sendMessage(_messages) {
      return { content: "This is a fake AI response for testing.", tokensUsed: 25 };
    },
    async streamMessage(_messages, onChunk) {
      const response = "This is a fake streamed response.";
      for (const word of response.split(" ")) {
        onChunk(word + " ");
      }
      return { content: response, tokensUsed: 20 };
    },
  };
}
