export class AccessTokenDTO {
  constructor(
    private readonly _accessToken: string,
    private readonly _refreshToken: string,
  ) {}

  get accessToken(): string {
    return this._accessToken;
  }

  get refreshToken(): string {
    return this._refreshToken;
  }
}
