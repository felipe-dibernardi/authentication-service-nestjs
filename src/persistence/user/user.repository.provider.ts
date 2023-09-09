import { Provider } from '@nestjs/common';
import { UserRepositoryMemory } from './user.repository.memory';

export const UserRepositoryProvider: Provider = {
  provide: 'UserRepository',
  useClass: UserRepositoryMemory,
};
