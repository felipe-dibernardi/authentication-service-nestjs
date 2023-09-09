import { OneOfEachPasswordValidationStrategy } from './oneofeach.password.validation.strategy';
import { PasswordValidation } from '../../domain/user/user.domain';
import { InvalidPasswordError } from '../../domain/user/error/invalid.password.error';

describe('One of each password validation strategy test', () => {
  let oneOfEachPasswordValidationStrategy: PasswordValidation;

  beforeEach(() => {
    oneOfEachPasswordValidationStrategy =
      new OneOfEachPasswordValidationStrategy();
  });

  it('Should validate password with no issue', () => {
    const password = 'v4l1dP4$$w0rD';
    oneOfEachPasswordValidationStrategy.validate(password);
  });

  it('Should throw InvalidPassword exception when password does not have a digit', () => {
    const password = 'asb$ajfaly';
    expect(() =>
      oneOfEachPasswordValidationStrategy.validate(password),
    ).toThrow(
      new InvalidPasswordError([
        'The password must contain at least one digit',
      ]),
    );
  });

  it('Should throw InvalidPassword exception when password does not have a character', () => {
    const password = '123*&01938';
    expect(() =>
      oneOfEachPasswordValidationStrategy.validate(password),
    ).toThrow(
      new InvalidPasswordError([
        'The password must contain at least one characters',
      ]),
    );
  });

  it('Should throw InvalidPassword exception when password does not have a symbol', () => {
    const password = '123abc9A8';
    expect(() =>
      oneOfEachPasswordValidationStrategy.validate(password),
    ).toThrow(
      new InvalidPasswordError([
        'The password must contain at least one of the following symbols !@#$%*()_=+{}-',
      ]),
    );
  });

  it('Should throw InvalidPassword exception when password does not have a symbol or a digit', () => {
    const password = 'AbstCatrda';
    expect(() =>
      oneOfEachPasswordValidationStrategy.validate(password),
    ).toThrow(
      new InvalidPasswordError([
        'The password must contain at least one digit',
        'The password must contain at least one of the following symbols !@#$%*()_=+{}-',
      ]),
    );
  });
});
