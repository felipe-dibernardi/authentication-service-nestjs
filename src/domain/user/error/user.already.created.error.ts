export class UserAlreadyCreatedError extends Error {
  constructor(username: string) {
    super(`User ${username} is already created.`);
  }
}
