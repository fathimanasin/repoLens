import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberPermissionsDto } from './dto/update-member-permissions.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createOrganization(
    userId: string,
    dto: CreateOrganizationDto,
  ) {
    const existingOrganization =
      await this.prisma.organization.findUnique({
        where: {
          slug: dto.slug,
        },
      });

    if (existingOrganization) {
      throw new ConflictException(
        'Organization slug already exists',
      );
    }

    const organization =
      await this.prisma.organization.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          ownerId: userId,
        },
      });

    const member =
      await this.prisma.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId,
          role: 'OWNER',
          permissions: [
  'analyze_repository',
  'upload_docs',
  'manage_members',
  'view_drift',
  'manage_workspace',
],
        },
      });

    return {
      organization,
      member,
    };
  }
  async findUserOrganizations(
  userId: string,
) {
  const memberships =
    await this.prisma.organizationMember.findMany({
      where: {
        userId,
      },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                workspaces: true,
              },
            },
          },
        },
      },
    });

  return memberships.map(
  (membership: any) => ({
    ...membership.organization,
    memberCount:
      membership.organization._count.members,
    workspaceCount:
      membership.organization._count.workspaces,
  }),
);
}

async findOrganizationById(
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
    throw new ForbiddenException(
      'Access denied',
    );
  }

  return this.prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      workspaces: true,
      _count: {
        select: {
          members: true,
          workspaces: true,
        },
      },
    },
  });
}

async inviteMember(
  organizationId: string,
  inviterId: string,
  dto: InviteMemberDto,
) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

  if (!user) {
    throw new NotFoundException(
      'No user found with this email',
    );
  }

  const existingMember =
    await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
    });

  if (existingMember) {
    throw new ConflictException(
      'User is already a member',
    );
  }

  return this.prisma.organizationMember.create({
    data: {
      organizationId,
      userId: user.id,
      role: 'MEMBER',
      permissions:
        dto.permissions ??
        ['view_drift'],
    },
  });
}

async updateMemberPermissions(
  organizationId: string,
  userId: string,
  dto: UpdateMemberPermissionsDto,
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
    throw new NotFoundException(
      'Member not found',
    );
  }

  return this.prisma.organizationMember.update({
    where: {
      id: member.id,
    },
    data: {
      permissions: dto.permissions,
    },
  });
}

async removeMember(
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
    throw new NotFoundException(
      'Member not found',
    );
  }

  if (member.role === 'OWNER') {
    throw new BadRequestException(
      'Organization owner cannot be removed',
    );
  }

  await this.prisma.organizationMember.delete({
    where: {
      id: member.id,
    },
  });

  return {
    success: true,
  };
}

}