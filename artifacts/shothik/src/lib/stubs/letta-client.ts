// Stub for @letta-ai/letta-client
export class LettaClient {
  agents = {
    retrieve: async () => ({ id: 'mock-agent-id' }),
    create: async () => ({ id: 'mock-agent-id' }),
    messages: {
      create: async () => ({ id: 'mock-msg-id', role: 'assistant', text: 'Mock response' }),
      list: async () => []
    }
  };
  blocks = {
    retrieve: async () => ({ id: 'mock-block-id', value: '' }),
    update: async () => ({ id: 'mock-block-id' })
  };
}

export default LettaClient;
