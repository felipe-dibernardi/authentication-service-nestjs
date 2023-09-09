export class CreateUserDTO {
  constructor(
    private readonly _username: string,
    private readonly _password: string,
    private readonly _firstName: string,
    private readonly _lastName: string,
  ) {}

  get username(): string {
    return this._username;
  }

  get password(): string {
    return this._password;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }
}
