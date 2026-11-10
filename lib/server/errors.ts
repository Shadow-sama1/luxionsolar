export class IntegrationUnavailableError extends Error {
  constructor(integration: string) {
    super(`${integration} is not configured on this server.`);
    this.name = "IntegrationUnavailableError";
  }
}

export class RateLimitExceededError extends Error {
  constructor() {
    super("Too many requests. Please try again later.");
    this.name = "RateLimitExceededError";
  }
}
