export class PasswordUpdateNotAllowedError extends Error {
  constructor() {
    super('Password cannot be updated through user update.');
  }
}
