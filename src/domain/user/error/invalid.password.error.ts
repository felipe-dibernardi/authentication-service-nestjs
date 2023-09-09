export class InvalidPasswordError extends Error {
  constructor(invalidReasons: string[]) {
    if (invalidReasons.length === 1) {
      super(`Password is invalid: ${invalidReasons[0]}`);
    } else {
      let reasons = 'Password is invalid: ';
      invalidReasons.forEach((reason) => {
        reasons = reasons.concat(`${reason},`);
      });
      super(reasons);
    }
  }
}
