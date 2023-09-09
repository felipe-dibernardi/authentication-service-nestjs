import { UserDTO } from '../dto/user.dto';
import { User } from '../../domain/user/user.domain';
import { CreateUserDTO } from '../dto/create-user.dto';

export class UserDTOConverter {
  public static convertDTOToDomain(dto: UserDTO): User {
    return User.create({
      id: dto.id,
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
  }

  public static convertCreateDTOToDomain(dto: CreateUserDTO): User {
    return User.createAndEncrypt({
      username: dto.username,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
  }

  public static convertDomainTODTO(user: User): UserDTO {
    return new UserDTO(user.id, user.username, user.firstName, user.lastName);
  }
}
