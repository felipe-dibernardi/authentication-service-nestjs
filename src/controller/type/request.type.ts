export type AuthRequest = Request & {
  headers: { authorization: string };
};
