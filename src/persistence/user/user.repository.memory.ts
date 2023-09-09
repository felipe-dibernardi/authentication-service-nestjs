import { UserRepository } from '../../domain/user/user.repository';
import { PasswordValidation, User } from '../../domain/user/user.domain';
import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../domain/user/error/entity.notfound.error';
import { v4 as uuidv4 } from 'uuid';

interface UserEntity {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class UserRepositoryMemory implements UserRepository {
  private readonly users: UserEntity[];

  constructor(
    @Inject('PasswordValidation')
    private readonly passwordValidation: PasswordValidation,
  ) {
    this.users = [];
  }

  public get(id: string): User {
    const userIndex = this.findIndex(id);
    if (userIndex !== -1) {
      return this.convertEntityToDomain(this.users[userIndex]);
    }
    throw new EntityNotFoundError(`User with id ${id} not found`);
  }

  public getByUsername(username: string): User {
    const userIndex = this.findIndexByUsername(username);
    if (userIndex !== -1) {
      return this.convertEntityToDomain(this.users[userIndex]);
    }
    throw new EntityNotFoundError(`User with username ${username} not found`);
  }

  public remove(id: string): void {
    const userIndex = this.findIndex(id);
    if (userIndex === -1) {
      throw new EntityNotFoundError(`User with id ${id} not found`);
    }
    this.users.splice(userIndex, 1);
  }

  public removeAll(): void {
    this.users.length = 0;
  }

  public insert(user: User): User {
    const userEntity = this.convertDomainToEntity(user);
    userEntity.id = uuidv4();
    this.users.push(userEntity);
    return this.convertEntityToDomain(userEntity);
  }

  public update(user: User): User {
    const userIndex = this.findIndex(user.id);
    const userEntity = this.convertDomainToEntity(user);
    this.users.splice(userIndex, 1, userEntity);
    return this.convertEntityToDomain(userEntity);
  }

  private findIndex(id: string): number {
    return this.users.findIndex((user) => user.id === id);
  }

  private findIndexByUsername(username: string): number {
    return this.users.findIndex((user) => user.username === username);
  }

  private convertDomainToEntity({
    id,
    username,
    password,
    firstName,
    lastName,
  }: User): UserEntity {
    return {
      id,
      username,
      password,
      firstName,
      lastName,
    };
  }

  private convertEntityToDomain({
    id,
    username,
    password,
    firstName,
    lastName,
  }: UserEntity): User {
    return User.create({
      id,
      username,
      password,
      passwordValidation: this.passwordValidation,
      firstName,
      lastName,
    });
  }
}
