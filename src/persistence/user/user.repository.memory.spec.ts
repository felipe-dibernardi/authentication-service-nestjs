import { UserRepository } from '../../domain/user/user.repository';
import { UserRepositoryMemory } from './user.repository.memory';
import { User } from '../../domain/user/user.domain';
import { HashUtils } from '../../utils/hash.utils';
import { EntityNotFoundError } from '../../domain/user/error/entity.notfound.error';

describe('User Memory Repository Test', () => {
  let userRepository: UserRepository;
  let user: User;
  beforeEach(() => {
    userRepository = new UserRepositoryMemory(undefined);
    userRepository.removeAll();
    user = userRepository.insert(
      User.createAndEncrypt({ username: 'username', password: 'password' }),
    );
  });

  it('Get user by ID', () => {
    const savedUser = userRepository.get(user.id);
    expect(savedUser.username).toEqual(user.username);
    expect(savedUser.id).toEqual(user.id);
    expect(HashUtils.compare(user.password, savedUser.password));
  });

  it('Create an user', () => {
    const savedUser = userRepository.getByUsername(user.username);
    expect(savedUser.username).toEqual(user.username);
    expect(savedUser.id).toEqual(user.id);
    expect(HashUtils.compare(user.password, savedUser.password));
  });

  it('Update an user', () => {
    user.changePassword('password', 'new-password');
    userRepository.update(user);
    const updatedUser = userRepository.get(user.id);
    expect(HashUtils.compare('new-password', updatedUser.password));
  });

  it('Remove an user', () => {
    const savedUser = userRepository.get(user.id);
    expect(savedUser).toBeTruthy();
    userRepository.remove(savedUser.id);
    expect(() => userRepository.getByUsername(user.id)).toThrow(
      EntityNotFoundError,
    );
  });

  it('Throw an error when trying to remove a non existing error', () => {
    expect(() => userRepository.remove('abc')).toThrow(EntityNotFoundError);
  });
});
