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

async getRepositoryBranches(
  userId: string,
  owner: string,
  repo: string,
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

  const [
    branchesResponse,
    repositoryResponse,
  ] = await Promise.all([
    octokit.repos.listBranches({
      owner,
      repo,
    }),

    octokit.repos.get({
      owner,
      repo,
    }),
  ]);

  return branchesResponse.data.map(
    (branch) => ({
      name: branch.name,

      isDefault:
        branch.name ===
        repositoryResponse.data.default_branch,
    }),
  );
}

async getRepositoryDetails(
  userId: string,
  owner: string,
  repo: string,
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
    await octokit.repos.get({
      owner,
      repo,
    });

  return {
    id: response.data.id,
    name: response.data.name,
    fullName:
      response.data.full_name,
    defaultBranch:
      response.data.default_branch,
    isPrivate:
      response.data.private,
    cloneUrl:
      response.data.clone_url,
  };
}

}