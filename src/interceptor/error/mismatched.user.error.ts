export class MismatchedUserError extends Error {
  constructor() {
    super('User in authorization does not match user on request');
  }
}
