import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-github2';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
) {}

  async validateGithubUser(
  profile: Profile,
  accessToken: string,
): Promise<{
    user: unknown;
    isNewUser: boolean;
  }> {
    const githubId = profile.id;
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new Error('GitHub account does not provide an email address');
    }

    const existingGithubUser = await this.prisma.user.findUnique({
      where: {
        githubId,
      },
    });

    if (existingGithubUser) {
  const updatedUser =
    await this.prisma.user.update({
      where: {
        id: existingGithubUser.id,
      },
      data: {
        githubAccessToken: accessToken,
      },
    });

  return {
    user: updatedUser,
    isNewUser: false,
  };
}
    const existingEmailUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmailUser) {
      const linkedUser = await this.prisma.user.update({
        where: {
          id: existingEmailUser.id,
        },
        data: {
          githubId,
          githubUsername: profile.username,
          githubAccessToken: accessToken,
          displayName: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
        },
      });

      return {
        user: linkedUser,
        isNewUser: false,
      };
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        githubId,
        githubUsername: profile.username,
        githubAccessToken: accessToken,
        displayName: profile.displayName,
        avatarUrl: profile.photos?.[0]?.value,
      },
    });

    return {
      user: newUser,
      isNewUser: true,
    };
  }

  async issueTokens(user: {
  id: string;
  email: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const payload = {
    sub: user.id,
    email: user.email,
  };

  const accessToken = await this.jwtService.signAsync(
    payload,
    {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    },
  );

  const refreshToken = await this.jwtService.signAsync(
  payload,
  {
    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    expiresIn: '7d',
  },
);

const refreshTokenHash = await bcrypt.hash(
  refreshToken,
  10,
);

await this.prisma.refreshToken.create({
  data: {
    tokenHash: refreshTokenHash,

    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ),

    user: {
      connect: {
        id: user.id,
      },
    },
  },
});

return {
  accessToken,
  refreshToken,
};


}

async refreshAccessToken(
  refreshToken: string,
): Promise<{
  accessToken: string;
}> {
  const payload = await this.jwtService.verifyAsync(
    refreshToken,
    {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
      ),
    },
  );

  const storedTokens =
    await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
      },
    });

  for (const storedToken of storedTokens) {
    const matches = await bcrypt.compare(
      refreshToken,
      storedToken.tokenHash,
    );

    if (matches) {
      const accessToken =
        await this.jwtService.signAsync(
          {
            sub: payload.sub,
            email: payload.email,
          },
          {
            secret: this.configService.get<string>(
              'JWT_SECRET',
            ),
            expiresIn: '15m',
          },
        );

      return {
        accessToken,
      };
    }
  }

  throw new UnauthorizedException(
  'Invalid refresh token',
);
}
async logout(
  refreshToken: string,
): Promise<{
  success: boolean;
}> {
  const payload = await this.jwtService.verifyAsync(
    refreshToken,
    {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
      ),
    },
  );

  await this.prisma.refreshToken.updateMany({
    where: {
      userId: payload.sub,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return {
    success: true,
  };
}

}