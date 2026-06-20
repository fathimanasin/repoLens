import {
  Controller,
  Get,
  Param,
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

@Get('repos/:owner/:repo/branches')
async getRepositoryBranches(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('owner')
  owner: string,

  @Param('repo')
  repo: string,
) {
  return this.githubService.getRepositoryBranches(
    user.id,
    owner,
    repo,
  );
}

}