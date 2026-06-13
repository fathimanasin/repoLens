import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createWorkspace(
    dto: CreateWorkspaceDto,
  ) {
    const existingWorkspace =
      await this.prisma.workspace.findFirst({
        where: {
          organizationId:
            dto.organizationId,
          slug: dto.slug,
        },
      });

    if (existingWorkspace) {
      throw new ConflictException(
        'Workspace slug already exists',
      );
    }

    return this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description:
          dto.description,
        template: 'CUSTOM' as any,
        organizationId:
          dto.organizationId,
      },
    });
  }

async findWorkspacesByOrg(
  organizationId: string,
  userId: string,
) {
  const member =
    await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

  if (!member) {
    throw new ConflictException(
      'Not a member of this organization',
    );
  }

  return this.prisma.workspace.findMany({
    where: {
      organizationId,
    },
    include: {
      _count: {
        select: {
          repositories: true,
          knowledgeCollections: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

async findWorkspaceById(
  workspaceId: string,
  userId: string,
) {
  const workspace =
    await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        repositories: true,
        knowledgeCollections: true,
        _count: {
          select: {
            repositories: true,
          },
        },
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

async updateWorkspace(
  workspaceId: string,
  userId: string,
  dto: UpdateWorkspaceDto,
) {
  const workspace =
    await this.findWorkspaceById(
      workspaceId,
      userId,
    );

  if (
    dto.slug &&
    dto.slug !== workspace.slug
  ) {
    const existing =
      await this.prisma.workspace.findFirst({
        where: {
          organizationId:
            workspace.organizationId,
          slug: dto.slug,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Workspace slug already exists',
      );
    }
  }

  return this.prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: dto,
  });
}

async deleteWorkspace(
  workspaceId: string,
  userId: string,
) {
  await this.findWorkspaceById(
    workspaceId,
    userId,
  );

  await this.prisma.workspace.delete({
    where: {
      id: workspaceId,
    },
  });

  return {
    success: true,
    message:
      'Workspace deleted successfully',
  };
}

}