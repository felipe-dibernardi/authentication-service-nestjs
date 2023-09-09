import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { UserRepositoryMemory } from '../persistence/user/user.repository.memory';
import { User } from '../domain/user/user.domain';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserDTO } from './dto/user.dto';
import { ChangePasswordDTO } from './dto/changepassword.dto';
import { HashUtils } from '../utils/hash.utils';

describe('User Controller Test', () => {
  let userController: UserController;
  let userService: UserService;
  let userRepository: UserRepositoryMemory;

  beforeEach(() => {
    userRepository = new UserRepositoryMemory(undefined);
    userService = new UserService(userRepository);
    userController = new UserController(userService);
  });

  it('Should get user correctly', () => {
    const username = 'username';
    const password = 'password';
    const firstName = 'John';
    const lastName = 'Doe';
    const id = 'abc';
    jest
      .spyOn(userRepository, 'getByUsername')
      .mockReturnValue(
        User.create({ username, password, firstName, lastName, id }),
      );

    const userResponse = userController.getUser(username);

    expect(userResponse).not.toBeNull();
    expect(userResponse.statusCode).toEqual(200);
    expect(userResponse.message).toBeUndefined();
    expect(userResponse.data.username).toEqual(username);
    expect(userResponse.data.id).toEqual('abc');
    expect(userResponse.data.firstName).toEqual(firstName);
    expect(userResponse.data.lastName).toEqual(lastName);
  });

  it('Should insert user correctly', () => {
    const username = 'username';
    const password = 'password';
    const firstName = 'John';
    const lastName = 'Doe';

    const userCreationDTO = new CreateUserDTO(
      username,
      password,
      firstName,
      lastName,
    );

    const userResponse = userController.insertUser(userCreationDTO);
    expect(userResponse).not.toBeNull();
    expect(userResponse.statusCode).toEqual(201);
    expect(userResponse.message).toEqual('User successfully added');
  });

  it('Should update user correctly', () => {
    const username = 'username';
    const password = 'password';
    const firstName = 'John';
    const lastName = 'Doe';

    const user = userService.insert(
      User.createAndEncrypt({ username, password, firstName, lastName }),
    );

    const userDTO = new UserDTO(user.id, username, 'Jane', 'Smith');

    const userResponse = userController.updateUser(username, userDTO);

    expect(userResponse).not.toBeNull();
    expect(userResponse.statusCode).toEqual(200);
    expect(userResponse.message).toEqual('User successfully updated');

    const updatedUser = userService.get(user.id);

    expect(updatedUser.firstName).toEqual('Jane');
    expect(updatedUser.lastName).toEqual('Smith');
  });

  it('Should be able to change password', () => {
    const username = 'username';
    const password = 'password';
    const firstName = 'John';
    const lastName = 'Doe';

    const user = userService.insert(
      User.createAndEncrypt({ username, password, firstName, lastName }),
    );

    const changePasswordDTO = new ChangePasswordDTO(password, 'new-password');

    const userResponse = userController.changePassword(
      username,
      changePasswordDTO,
    );

    expect(userResponse).not.toBeNull();
    expect(userResponse.statusCode).toEqual(200);
    expect(userResponse.message).toEqual('Password successfully updated');

    const updatedUser = userService.get(user.id);

    expect(
      HashUtils.compare('new-password', updatedUser.password),
    ).toBeTruthy();
  });
});
