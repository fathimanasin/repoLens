import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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
  ): Promise<any> {
    const tokens = await this.authService.issueTokens({
  id: req.user.user.id,
  email: req.user.user.email,
});



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
}
