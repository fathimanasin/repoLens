import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Octokit } from '@octokit/rest';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GithubService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getUserRepositories(
    userId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user?.githubAccessToken) {
      throw new UnauthorizedException(
        'GitHub account not connected',
      );
    }

    const octokit =
      new Octokit({
        auth: user.githubAccessToken,
      });

    const response =
      await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

    return response.data.map(
      (repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        defaultBranch:
          repo.default_branch,
        cloneUrl:
          repo.clone_url,
        htmlUrl:
          repo.html_url,
      }),
    );
  }
}