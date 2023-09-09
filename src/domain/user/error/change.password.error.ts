export class ChangePasswordError extends Error {
  constructor() {
    super('Cannot change password. Old password does not match');
  }
}
