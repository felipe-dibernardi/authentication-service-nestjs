import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/user/user.repository';
import { User } from '../domain/user/user.domain';
import { UserAlreadyCreatedError } from '../domain/user/error/user.already.created.error';
import { EntityNotFoundError } from '../domain/user/error/entity.notfound.error';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  public get(id: string): User {
    return this.userRepository.get(id);
  }

  public getByUsername(username: string): User {
    return this.userRepository.getByUsername(username);
  }

  public insert(user: User): User {
    try {
      this.userRepository.getByUsername(user.username);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        return this.userRepository.insert(user);
      }
      throw err;
    }
    throw new UserAlreadyCreatedError(user.username);
  }

  public update(user: User): User {
    const currentUser = this.userRepository.get(user.id);
    const updatedUser = currentUser.copyNonUpdatableProperties(user);
    return this.userRepository.update(updatedUser);
  }

  public remove(id: string): void {
    this.userRepository.remove(id);
  }

  public changePassword(
    username: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user: User = this.userRepository.getByUsername(username);
    user.changePassword(currentPassword, newPassword);
    this.userRepository.update(user);
  }
}
