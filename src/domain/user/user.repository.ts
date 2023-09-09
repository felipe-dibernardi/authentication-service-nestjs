import { PasswordValidation, User } from './user.domain';

export interface UserRepository {
  get(id: string): User;
  getByUsername(username: string): User;
  insert(user: User): User;
  update(user: User): User;
  remove(username: string): void;
  removeAll(): void;
}
