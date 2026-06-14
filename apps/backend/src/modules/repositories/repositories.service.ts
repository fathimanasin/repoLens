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
}