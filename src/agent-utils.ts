/**
 * Utility helpers for agent lifecycle management.
 */

export interface AgentConfig {
  id: string;
  name: string;
  maxRetries: number;
  timeoutMs: number;
}

export class AgentError extends Error {
  constructor(
    public readonly agentId: string,
    message: string,
    public readonly retryable: boolean = false,
  ) {
    super(`[${agentId}] ${message}`);
    this.name = "AgentError";
  }
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: AgentConfig,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < config.maxRetries) {
        const delay = Math.min(1000 * 2 ** attempt, config.timeoutMs);
        await sleep(delay);
      }
    }
  }

  throw new AgentError(config.id, lastError?.message ?? "Unknown error", true);
}

/**
 * Validate an agent config object.
 */
export function validateConfig(config: unknown): config is AgentConfig {
  if (typeof config !== "object" || config === null) return false;
  const c = config as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    typeof c.maxRetries === "number" &&
    typeof c.timeoutMs === "number"
  );
}
