export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid or missing token');
  }
}
