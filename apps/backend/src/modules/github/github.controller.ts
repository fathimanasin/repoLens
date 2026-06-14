import {
  Controller,
  Get,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }

  @Get('repos')
  async getRepositories(
    @CurrentUser() user: {
      id: string;
      email: string;
    },
  ) {
    return this.githubService.getUserRepositories(
      user.id,
    );
  }
}