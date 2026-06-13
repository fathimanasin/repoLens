import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';

import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberPermissionsDto } from './dto/update-member-permissions.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Get()
async findMyOrganizations(
  @CurrentUser() user: {
    id: string;
    email: string;
  },
) {
  return this.organizationsService.findUserOrganizations(
    user.id,
  );
}

@Get(':organizationId')
async findOne(
  @CurrentUser() user: {
    id: string;
    email: string;
  },
  @Param('organizationId')
  organizationId: string,
) {
  return this.organizationsService.findOrganizationById(
    organizationId,
    user.id,
  );
}

@Post(':organizationId/members/invite')
@UseGuards(PermissionsGuard)
@RequirePermissions(
  'manage_members',
)
async inviteMember(
  @CurrentUser() user: {
    id: string;
    email: string;
  },
  @Param('organizationId')
  organizationId: string,
  @Body()
  dto: InviteMemberDto,
) {
  return this.organizationsService.inviteMember(
    organizationId,
    user.id,
    dto,
  );
}

@Patch(
  ':organizationId/members/:userId/permissions',
)
@UseGuards(PermissionsGuard)
@RequirePermissions(
  'manage_members',
)
async updateMemberPermissions(
  @Param('organizationId')
  organizationId: string,

  @Param('userId')
  userId: string,

  @Body()
  dto: UpdateMemberPermissionsDto,
) {
  return this.organizationsService.updateMemberPermissions(
    organizationId,
    userId,
    dto,
  );
}

@Delete(
  ':organizationId/members/:userId',
)
@UseGuards(PermissionsGuard)
@RequirePermissions(
  'manage_members',
)
async removeMember(
  @Param('organizationId')
  organizationId: string,

  @Param('userId')
  userId: string,
) {
  return this.organizationsService.removeMember(
    organizationId,
    userId,
  );
}

  @Post()
  async createOrganization(
    @CurrentUser() user: {
      id: string;
      email: string;
    },
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.createOrganization(
      user.id,
      dto,
    );
  }
}