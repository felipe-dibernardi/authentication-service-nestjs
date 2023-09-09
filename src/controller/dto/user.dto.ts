export class UserDTO {
  constructor(
    private readonly _id: string,
    private readonly _username: string,
    private readonly _firstName: string,
    private readonly _lastName: string,
  ) {}

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }
}
