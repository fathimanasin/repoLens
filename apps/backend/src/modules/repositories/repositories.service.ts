import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ConnectRepositoryDto } from './dto/connect-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';

@Injectable()
export class RepositoriesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async verifyRepositoryAccess(
  repositoryId: string,
  userId: string,
) {
  const repository =
    await this.prisma.repository.findUnique({
      where: {
        id: repositoryId,
      },
      include: {
        workspace: true,
      },
    });

  if (!repository) {
    throw new NotFoundException(
      'Repository not found',
    );
  }

  const member =
    await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            repository.workspace.organizationId,
          userId,
        },
      },
    });

  if (!member) {
    throw new ForbiddenException(
      'Access denied',
    );
  }

  return repository;
}

private async verifyWorkspaceAccess(
  workspaceId: string,
  userId: string,
) {
  const workspace =
  await this.prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

if (!workspace) {
  throw new NotFoundException(
    'Workspace not found',
  );
}

const member =
  await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            workspace.organizationId,
          userId,
        },
      },
    });

  if (!member) {
    throw new ForbiddenException(
      'Access denied',
    );
  }

  return workspace;
}

  async connectRepository(
  userId: string,
  dto: ConnectRepositoryDto,
) {
  await this.verifyWorkspaceAccess(
    dto.workspaceId,
    userId,
  );

  const existingRepository =
      await this.prisma.repository.findFirst({
        where: {
          workspaceId: dto.workspaceId,
          fullName: dto.fullName,
        },
      });

    if (existingRepository) {
      throw new ConflictException(
        'Repository already connected',
      );
    }

    return this.prisma.repository.create({
      data: {
        githubRepositoryId:
          dto.githubRepositoryId,

        owner:
          dto.owner,

        name:
          dto.name,

        fullName:
          dto.fullName,

        defaultBranch:
          dto.defaultBranch,

        cloneUrl:
          dto.cloneUrl,

        isPrivate:
          dto.isPrivate,

        workspaceId:
          dto.workspaceId,
      },
    });
  }

async findByWorkspace(
  workspaceId: string,
  userId: string,
) {
  await this.verifyWorkspaceAccess(
    workspaceId,
    userId,
  );

  return this.prisma.repository.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

async findById(
  repositoryId: string,
  userId: string,
) {
  await this.verifyRepositoryAccess(
    repositoryId,
    userId,
  );

  const repository =
    await this.prisma.repository.findUnique({
      where: {
        id: repositoryId,
      },
      include: {
        analyses: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            analyses: true,
            driftEvents: true,
          },
        },
      },
    });

  if (!repository) {
    throw new NotFoundException(
      'Repository not found',
    );
  }

  return repository;
}

async findAnalyses(
  repositoryId: string,
  userId: string,
) {
  await this.verifyRepositoryAccess(
    repositoryId,
    userId,
  );

  return this.prisma.repositoryAnalysis.findMany({
    where: {
      repositoryId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async findAnalysisById(
  repositoryId: string,
  analysisId: string,
  userId: string,
) {
  await this.verifyRepositoryAccess(
    repositoryId,
    userId,
  );

  const analysis =
    await this.prisma.repositoryAnalysis.findFirst({
      where: {
        id: analysisId,
        repositoryId,
      },
    });

  if (!analysis) {
    throw new NotFoundException(
      'Analysis not found',
    );
  }

  return analysis;
}

async findDriftEvents(
  repositoryId: string,
  userId: string,
) {
  await this.verifyRepositoryAccess(
    repositoryId,
    userId,
  );

  return this.prisma.driftEvent.findMany({
    where: {
      repositoryId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async findDriftEventById(
  repositoryId: string,
  eventId: string,
  userId: string,
) {
  await this.verifyRepositoryAccess(
    repositoryId,
    userId,
  );

  const event =
    await this.prisma.driftEvent.findFirst({
      where: {
        id: eventId,
        repositoryId,
      },
    });

  if (!event) {
    throw new NotFoundException(
      'Drift event not found',
    );
  }

  return event;
}

async getDashboard(
  repositoryId: string,
  userId: string,
) {
  await this.verifyRepositoryAccess(
    repositoryId,
    userId,
  );

  const repository =
    await this.prisma.repository.findUnique({
      where: {
        id: repositoryId,
      },
      include: {
        _count: {
          select: {
            analyses: true,
            driftEvents: true,
          },
        },
      },
    });

  if (!repository) {
    throw new NotFoundException(
      'Repository not found',
    );
  }

  const latestAnalysis =
    await this.prisma.repositoryAnalysis.findFirst({
      where: {
        repositoryId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

  const latestDrift =
    await this.prisma.driftEvent.findFirst({
      where: {
        repositoryId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

  return {
    repository,
    analysisCount:
      repository._count.analyses,
    driftCount:
      repository._count.driftEvents,
    latestAnalysis,
    latestDrift,
  };
}

async updateRepository(
  repositoryId: string,
  userId: string,
  dto: UpdateRepositoryDto,
) {
  await this.verifyRepositoryAccess(
    repositoryId,
    userId,
  );

  return this.prisma.repository.update({
    where: {
      id: repositoryId,
    },
    data: dto,
  });
}

async disconnectRepository(
  repositoryId: string,
  userId: string,
) {
  const repository =
    await this.verifyRepositoryAccess(
      repositoryId,
      userId,
    );

  const member =
    await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            repository.workspace.organizationId,
          userId,
        },
      },
    });

  if (
    !member?.permissions.includes(
      'manage_workspace',
    )
  ) {
    throw new ForbiddenException(
      'Insufficient permissions',
    );
  }

  await this.prisma.repository.delete({
    where: {
      id: repositoryId,
    },
  });

  return {
    success: true,
  };
}

}