import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiFoundResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
      constructor(
    private readonly authService: AuthService,
  ) {}
  @Public()
  @UseGuards(AuthGuard('github'))
  @Get('github')
  @ApiFoundResponse({
    description: 'Redirects to GitHub OAuth',
  })
  async githubLogin(): Promise<void> {}

  @Public()
  @UseGuards(AuthGuard('github'))
  @Get('github/callback')
  @ApiFoundResponse({
    description: 'GitHub OAuth callback',
  })
  async githubCallback(
  @Req() req: any,
  @Res({ passthrough: true })
  res: Response,
): Promise<any> {
    const tokens = await this.authService.issueTokens({
  id: req.user.user.id,
  email: req.user.user.email,
});
res.cookie(
  'access_token',
  tokens.accessToken,
  {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 15 * 60 * 1000,
  },
);

res.cookie(
  'refresh_token',
  tokens.refreshToken,
  {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
);


return {
  user: req.user.user,
  isNewUser: req.user.isNewUser,
  ...tokens,
};
  }
  @Get('me')
@UseGuards(AuthGuard('jwt'))
async me(
  @CurrentUser() user: any,
): Promise<any> {
  return user;
}
@Public()
@Post('refresh')
async refresh(
  @Body('refreshToken') refreshToken: string,
): Promise<any> {
  return this.authService.refreshAccessToken(
    refreshToken,
  );
}
@Public()
@Post('logout')
async logout(
  @Body('refreshToken') refreshToken: string,
): Promise<any> {
  return this.authService.logout(
    refreshToken,
  );
}
}
