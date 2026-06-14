import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ConnectRepositoryDto } from './dto/connect-repository.dto';

@Injectable()
export class RepositoriesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async connectRepository(
    dto: ConnectRepositoryDto,
  ) {
    const workspace =
      await this.prisma.workspace.findUnique({
        where: {
          id: dto.workspaceId,
        },
      });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found',
      );
    }

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
) {
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
) {
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
) {
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
) {
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
) {
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
) {
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
) {
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

}