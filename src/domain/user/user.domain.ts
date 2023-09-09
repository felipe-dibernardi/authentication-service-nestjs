import { ChangePasswordError } from './error/change.password.error';
import { HashUtils } from '../../utils/hash.utils';

export interface PasswordValidation {
  validate(password: string): void;
}

export interface UserCreationProps {
  id?: string;
  username: string;
  password?: string;
  passwordValidation?: PasswordValidation;
  firstName?: string;
  lastName?: string;
}

export interface UserUpdateProps {
  firstName?: string;
  lastName?: string;
}

export class User {
  private constructor(
    private _username: string,
    private _password: string,
    private readonly _passwordValidation: PasswordValidation,
    private _id?: string,
    private _firstName?: string,
    private _lastName?: string,
  ) {}

  public static create({
    id,
    username,
    password,
    passwordValidation,
    firstName,
    lastName,
  }: UserCreationProps): User {
    if (!passwordValidation) {
      return new User(
        username,
        password,
        {
          validate(password: string): void {
            return;
          },
        },
        id,
        firstName,
        lastName,
      );
    }
    passwordValidation.validate(password);
    return new User(
      username,
      password,
      passwordValidation,
      id,
      firstName,
      lastName,
    );
  }

  public static createAndEncrypt({
    username,
    password,
    passwordValidation,
    firstName,
    lastName,
  }: UserCreationProps): User {
    return this.create({
      id: undefined,
      username,
      password: HashUtils.encrypt(password),
      passwordValidation,
      firstName,
      lastName,
    });
  }

  public copyNonUpdatableProperties({ firstName, lastName }: UserUpdateProps) {
    return User.create({
      id: this._id,
      username: this._username,
      password: this._password,
      passwordValidation: this._passwordValidation,
      firstName: firstName ? firstName : this._firstName,
      lastName: lastName ? lastName : this._lastName,
    });
  }

  public changePassword(oldPassword: string, newPassword: string): void {
    if (!HashUtils.compare(oldPassword, this.password)) {
      throw new ChangePasswordError();
    }
    this._passwordValidation.validate(newPassword);
    this._password = HashUtils.encrypt(newPassword);
  }

  get id(): string {
    return this._id;
  }

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
