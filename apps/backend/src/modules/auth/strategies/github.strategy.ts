import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
 constructor(
  configService: ConfigService,
  private readonly authService: AuthService,
) {
  

  super({
    clientID: configService.get<string>('GITHUB_CLIENT_ID')!,
    clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
    callbackURL: configService.get<string>('GITHUB_CALLBACK_URL')!,
    scope: ['read:user', 'user:email'],
  });

}

  async validate(
  accessToken: string,
  refreshToken: string,
  profile: Profile,
): Promise<{
  user: unknown;
  isNewUser: boolean;
}> {
  

  return this.authService.validateGithubUser(
  profile,
  accessToken,
);
}
}