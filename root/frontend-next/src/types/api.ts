// ABOUTME: API error handling utilities
// ABOUTME: Custom error class for API client errors with status codes

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}
