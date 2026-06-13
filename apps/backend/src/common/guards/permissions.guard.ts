import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '../../prisma/prisma.service';
import {
  PERMISSIONS_KEY,
} from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const required =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (
      !required ||
      required.length === 0
    ) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    const organizationId =
      request.params.organizationId ||
      request.body.organizationId ||
      null;

    if (!organizationId) {
      return true;
    }

    const member =
      await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: user.id,
          },
        },
      });

    if (!member) {
      throw new ForbiddenException(
        'Not a member of this organization',
      );
    }

    const hasAll = required.every(
      (permission) =>
        member.permissions.includes(
          permission,
        ),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        'Insufficient permissions',
      );
    }

    return true;
  }
}