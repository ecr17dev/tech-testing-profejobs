import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { CurrentUser } from './current-user.interface';
import { UserRole } from '../enums/user-role.enum';
import { DEMO_IDS, MOCK_TOKENS } from '../../database/seed/constants';

const USERS_BY_TOKEN: Record<string, CurrentUser> = {
  [MOCK_TOKENS.DIRECTOR]: {
    id: DEMO_IDS.director,
    institutionId: DEMO_IDS.institution,
    role: UserRole.DIRECTOR,
  },
  [MOCK_TOKENS.UTP]: {
    id: DEMO_IDS.utp,
    institutionId: DEMO_IDS.institution,
    role: UserRole.UTP,
  },
  [MOCK_TOKENS.TEACHER]: {
    id: DEMO_IDS.teacher,
    institutionId: DEMO_IDS.institution,
    role: UserRole.TEACHER,
  },
  [MOCK_TOKENS.TEACHER_OTHER]: {
    id: DEMO_IDS.teacherOther,
    institutionId: DEMO_IDS.institution,
    role: UserRole.TEACHER,
  },
};

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: CurrentUser;
    }>();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const user = USERS_BY_TOKEN[token];

    if (!user) {
      throw new UnauthorizedException('Token mock inválido');
    }

    request.user = user;
    return true;
  }
}
