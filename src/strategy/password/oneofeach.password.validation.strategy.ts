import { PasswordValidation } from '../../domain/user/user.domain';
import { Injectable } from '@nestjs/common';
import { InvalidPasswordError } from '../../domain/user/error/invalid.password.error';

@Injectable()
export class OneOfEachPasswordValidationStrategy implements PasswordValidation {
  validate(password: string): void {
    const atLeastOneDigit = new RegExp(/[0-9]/i);
    const atLeastOneCharacter = new RegExp(/[A-Z]/i);
    const atLeastOneSymbol = new RegExp(/[!@#$%*()_=+{}-]/i);

    const errorMessages = [];

    if (!atLeastOneDigit.test(password)) {
      errorMessages.push('The password must contain at least one digit');
    }
    if (!atLeastOneCharacter.test(password)) {
      errorMessages.push('The password must contain at least one characters');
    }
    if (!atLeastOneSymbol.test(password)) {
      errorMessages.push(
        'The password must contain at least one of the following symbols !@#$%*()_=+{}-',
      );
    }

    if (errorMessages.length > 0) {
      throw new InvalidPasswordError(errorMessages);
    }
  }
}
