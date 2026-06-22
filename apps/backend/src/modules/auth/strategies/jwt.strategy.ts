import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
  configService: ConfigService,
  private readonly prisma: PrismaService,
) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
  (request: Request) => {
    return request?.cookies?.access_token;
  },
  ExtractJwt.fromAuthHeaderAsBearerToken(),
]),

      ignoreExpiration: false,

      secretOrKey:
        configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: {
  sub: string;
  email: string;
}): Promise<{
  id: string;
  email: string;
}> {
  const user =
    await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

  if (!user) {
    throw new UnauthorizedException();
  }

  return {
    id: user.id,
    email: user.email,
  };
}
}