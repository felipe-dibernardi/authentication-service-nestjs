import { UserRepositoryMemory } from '../persistence/user/user.repository.memory';
import { UserService } from './user.service';
import { User } from '../domain/user/user.domain';
import { HashUtils } from '../utils/hash.utils';
import { EntityNotFoundError } from '../domain/user/error/entity.notfound.error';
import { UserAlreadyCreatedError } from '../domain/user/error/user.already.created.error';

describe('User Service Test', () => {
  let userRepository: UserRepositoryMemory;
  let userService: UserService;

  beforeEach(() => {
    userRepository = new UserRepositoryMemory(undefined);
    userService = new UserService(userRepository);
  });
  it('Should be able to get user by id', () => {
    const savedUser = userRepository.insert(
      User.createAndEncrypt({ username: 'username', password: 'password' }),
    );

    const retrievedUser = userService.get(savedUser.id);

    expect(savedUser.id).toEqual(retrievedUser.id);
    expect(savedUser.username).toEqual(retrievedUser.username);
    expect(HashUtils.compare('password', retrievedUser.password));
  });

  it('Should be able to get user by username', () => {
    const savedUser = userService.insert(
      User.createAndEncrypt({ username: 'username', password: 'password' }),
    );

    const retrievedUser = userService.getByUsername(savedUser.username);

    expect(savedUser.id).toEqual(retrievedUser.id);
    expect(savedUser.username).toEqual(retrievedUser.username);
    expect(HashUtils.compare('password', retrievedUser.password));
  });

  it('Should throw UserAlreadyExistsError when trying to add user with an existing username', () => {
    const username = 'username';
    const password = 'password';
    const firstName = 'John';
    const lastName = 'Doe';

    userService.insert(
      User.createAndEncrypt({
        username,
        password,
        firstName,
        lastName,
      }),
    );

    expect(() =>
      userService.insert(
        User.createAndEncrypt({
          username,
          password: 'new-password',
          firstName: 'Jane',
          lastName: 'Smith',
        }),
      ),
    ).toThrow(new UserAlreadyCreatedError(username));
  });

  it('Should throw whatever other error it gets besides EntityNotFound when failing on getByUsername on insert', () => {
    jest.spyOn(userRepository, 'getByUsername').mockImplementation(() => {
      throw new Error('Whatever error');
    });

    expect(() =>
      userService.insert(
        User.createAndEncrypt({
          username: 'username',
          password: 'password',
          firstName: 'Jane',
          lastName: 'Smith',
        }),
      ),
    ).toThrow(new Error('Whatever error'));
  });

  it('Should update user first name information', () => {
    const user = userService.insert(
      User.createAndEncrypt({
        username: 'username',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      }),
    );

    const toUpdateUser = user.copyNonUpdatableProperties({
      firstName: 'Jane',
    });

    userService.update(toUpdateUser);
    const updatedUser = userService.get(user.id);
    expect(user.firstName).toEqual('John');
    expect(updatedUser.firstName).toEqual('Jane');
  });

  it('Should update user last name information', () => {
    const user = userService.insert(
      User.createAndEncrypt({
        username: 'username',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      }),
    );

    const toUpdateUser = user.copyNonUpdatableProperties({
      lastName: 'Smith',
    });

    userService.update(toUpdateUser);
    const updatedUser = userService.get(user.id);
    expect(user.lastName).toEqual('Doe');
    expect(updatedUser.lastName).toEqual('Smith');
  });

  it('Should remove user', () => {
    const user = userService.insert(
      User.createAndEncrypt({
        username: 'username',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      }),
    );

    expect(userService.get(user.id)).not.toBeNull();

    userService.remove(user.id);

    expect(() => userService.get(user.id)).toThrow(
      new EntityNotFoundError(`User with id ${user.id} not found`),
    );
  });

  it('Should change user password', () => {
    const oldPassword = 'password';
    const newPassword = 'new-password';
    const user: User = User.createAndEncrypt({
      username: 'username',
      password: oldPassword,
    });
    jest.spyOn(userRepository, 'getByUsername').mockImplementation(() => user);

    userService.changePassword('username', oldPassword, newPassword);

    expect(HashUtils.compare(newPassword, user.password)).toBeTruthy();
  });
});
