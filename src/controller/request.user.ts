import { Request } from '@nestjs/common';
import { SubInfo } from '../security/types/jwt.payload.type';

export type RequestUser = Request & { user: SubInfo };
