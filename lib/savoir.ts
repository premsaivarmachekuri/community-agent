import { createLogger } from './logger';

const logger = createLogger('savoir');

type BashResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

type BashBatchResult = {
  results: (BashResult & { command: string })[];
  sessionId?: string;
};

export function createSavoirClient(apiUrl: string, apiKey?: string) {
  const baseUrl = apiUrl.replace(/\/$/, '');
  let sessionId: string | undefined;

  async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...body, sessionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Savoir API error: ${response.status}`);
    }

    if (data.sessionId) sessionId = data.sessionId;
    return data as T;
  }

  return {
    async bash(command: string): Promise<BashResult> {
      logger.debug('Executing bash', { command });
      return post<BashResult>('/api/sandbox/shell', { command });
    },

    async bashBatch(commands: string[]): Promise<BashBatchResult> {
      logger.debug('Executing bash batch', { count: commands.length });
      return post<BashBatchResult>('/api/sandbox/shell', { commands });
    },
  };
}
