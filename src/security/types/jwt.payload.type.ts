export type JwtPayloadType = {
  sub: SubInfo;
  iat: number;
  exp: number;
};

export type SubInfo = {
  id: string;
  username: string;
};
