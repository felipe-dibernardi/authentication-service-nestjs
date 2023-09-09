import { UserDTO } from '../dto/user.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserDTOConverter } from './user.dto.converter';
import { User } from '../../domain/user/user.domain';
import { CreateUserDTO } from '../dto/create-user.dto';
import { HashUtils } from '../../utils/hash.utils';

describe('User DTO Converter Test', () => {
  it('Should convert DTO to Domain without encryption correctly', () => {
    const id: string = uuidv4();
    const userDTO: UserDTO = new UserDTO(id, 'username', 'John', 'Doe');
    const user: User = UserDTOConverter.convertDTOToDomain(userDTO);
    expect(user.username).toEqual('username');
    expect(user.id).toEqual(id);
    expect(user.firstName).toEqual('John');
    expect(user.lastName).toEqual('Doe');
  });

  it('Should convert Create DTO to domain with password encryption', () => {
    const createUserDTO: CreateUserDTO = new CreateUserDTO(
      'username',
      'password',
      'John',
      'Doe',
    );
    const user: User = UserDTOConverter.convertCreateDTOToDomain(createUserDTO);
    expect(user.username).toEqual('username');
    expect(HashUtils.compare('password', user.password)).toBeTruthy();
  });

  it('Should convert Domain to UserDTO', () => {
    const id: string = uuidv4();
    const user: User = User.create({
      id,
      username: 'username',
      firstName: 'John',
      lastName: 'Doe',
    });
    const userDTO: UserDTO = UserDTOConverter.convertDomainTODTO(user);
    expect(userDTO.username).toEqual('username');
    expect(userDTO.id).toEqual(id);
    expect(userDTO.firstName).toEqual('John');
    expect(userDTO.lastName).toEqual('Doe');
  });
});
