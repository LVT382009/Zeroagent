

## 2026-05-25
- [high] src/agent-utils.ts:47 â€” bug: Diagnosis: `timeoutMs` is used as a cap on individual backoff delay (`Math.min(1000 * 2 ** attempt, config.timeoutMs)`), but the name implies a wall-clock timeout for the entire retry sequence. There is no actual timeout enforcement on `fn()` — a single stuck invocation can exceed `timeoutMs` indefinitely. This semantic mismatch will mislead callers into believing retries are time-bounded. Fix: either rename the field to something like `maxDelayMs` to reflect actual behavior, or implement a true wall-clock timeout via `Promise.race` / `AbortController` around the entire retry loop.

## 2026-05-25
- [high] src/agent-utils.ts:46 â€” bug: The `timeoutMs` field is used to cap individual backoff delays (`Math.min(1000 * 2 ** attempt, config.timeoutMs)`), but its name and typical usage imply a wall-clock timeout for the entire retry sequence. No actual timeout is enforced on the `fn()` invocation, so a single hung call can exceed `timeoutMs` indefinitely.