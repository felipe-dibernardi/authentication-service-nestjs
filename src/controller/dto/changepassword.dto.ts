export class ChangePasswordDTO {
  constructor(
    private readonly _currentPassword,
    private readonly _newPassword,
  ) {}

  get currentPassword() {
    return this._currentPassword;
  }

  get newPassword() {
    return this._newPassword;
  }
}
