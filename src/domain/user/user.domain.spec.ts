import { PasswordValidation, User } from './user.domain';
import { InvalidPasswordError } from './error/invalid.password.error';
import { ChangePasswordError } from './error/change.password.error';
import { HashUtils } from '../../utils/hash.utils';

describe('User Domain Test', () => {
  it('Should create an user with default password validation', () => {
    const user = User.createAndEncrypt({
      username: 'user-test',
      password: 'user-password',
    });

    expect(user.password).not.toEqual('user-password');
    expect(HashUtils.compare('user-password', user.password)).toBeTruthy();
    expect(user.username).toEqual('user-test');
  });

  it('Should create an user with custom password validation', () => {
    const passwordValidation: PasswordValidation = {
      validate(password: string): void {
        const regexShouldNotContain = new RegExp('([#$%*()])$');
        if (password.length < 8) {
          throw new InvalidPasswordError([
            'Password should have at least 8 characters',
          ]);
        }
        if (regexShouldNotContain.test(password)) {
          throw new InvalidPasswordError([
            'Should not contain the following symbols: #$%*()',
          ]);
        }
      },
    };
    const user = User.createAndEncrypt({
      username: 'user-test',
      password: 'user-password',
      passwordValidation,
    });

    expect(HashUtils.compare('user-password', user.password)).toBeTruthy();
    expect(user.username).toEqual('user-test');
  });

  it('Should fail creating an user with custom password validation', () => {
    const passwordValidation: PasswordValidation = {
      validate(password: string): void {
        const atLeastOneDigit = new RegExp('/d/');
        const atLeastOneCharacter = new RegExp(/[A-Z]/i);
        const regexShouldNotContain = new RegExp('([#$%*()]+)$');
        if (password.length < 8) {
          throw new InvalidPasswordError([
            'Password should have at least 8 characters',
          ]);
        }
        if (!atLeastOneDigit.test(password)) {
          throw new InvalidPasswordError(['Should contain at least one digit']);
        }
        if (!atLeastOneCharacter.test(password)) {
          throw new InvalidPasswordError([
            'Should contain at least one character',
          ]);
        }
        if (regexShouldNotContain.test(password)) {
          throw new InvalidPasswordError([
            'Should not contain the following symbols: #$%*()',
          ]);
        }
      },
    };
    expect(() => {
      User.create({
        id: 'abc',
        username: 'user-test',
        password: 'user-password',
        passwordValidation,
      });
    }).toThrow(InvalidPasswordError);
  });

  describe('Password Change Test', () => {
    let user: User;
    beforeEach(() => {
      user = User.createAndEncrypt({
        username: 'user-test',
        password: 'user-password',
      });
    });

    it('Should be able to change password', () => {
      user.changePassword('user-password', 'new-password');

      expect(HashUtils.compare('new-password', user.password)).toBeTruthy();
    });

    it('Should not be able to change password if old password not matching', () => {
      expect(() => {
        user.changePassword('wrong-old-password', 'new-password');
      }).toThrow(ChangePasswordError);
      expect(HashUtils.compare('user-password', user.password)).toBeTruthy();
    });

    it('Should not be able to change password if new password not valid', () => {
      const passwordValidation: PasswordValidation = {
        validate(password: string): void {
          const regexShouldNotContain = new RegExp('([#$%*()])$');
          if (password.length < 8) {
            throw new InvalidPasswordError([
              'Password should have at least 8 characters',
            ]);
          }
          if (regexShouldNotContain.test(password)) {
            throw new InvalidPasswordError([
              'Should not contain the following symbols: #$%*()',
            ]);
          }
        },
      };
      user = User.createAndEncrypt({
        username: 'user-test',
        password: 'user-password',
        passwordValidation,
      });
      expect(() => {
        user.changePassword('user-password', 'passwordwithwrongsymbol$');
      }).toThrow(InvalidPasswordError);
      expect(HashUtils.compare('user-password', user.password)).toBeTruthy();
    });
  });
});
