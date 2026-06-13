import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
  ) {}

@Get()
async findByOrganization(
  @CurrentUser() user: {
    id: string;
    email: string;
  },
  @Query('organizationId')
  organizationId: string,
) {
  return this.workspacesService.findWorkspacesByOrg(
    organizationId,
    user.id,
  );
}

@Get(':workspaceId')
async findOne(
  @CurrentUser() user: {
    id: string;
    email: string;
  },
  @Param('workspaceId')
  workspaceId: string,
) {
  return this.workspacesService.findWorkspaceById(
    workspaceId,
    user.id,
  );
}

@Patch(':workspaceId')
@UseGuards(PermissionsGuard)
@RequirePermissions(
  'manage_workspace',
)
async updateWorkspace(
  @CurrentUser() user: {
    id: string;
    email: string;
  },
  @Param('workspaceId')
  workspaceId: string,
  @Body()
  dto: UpdateWorkspaceDto,
) {
  return this.workspacesService.updateWorkspace(
    workspaceId,
    user.id,
    dto,
  );
}  

@Delete(':workspaceId')
@UseGuards(PermissionsGuard)
@RequirePermissions(
  'manage_workspace',
)
async deleteWorkspace(
  @CurrentUser() user: {
    id: string;
    email: string;
  },
  @Param('workspaceId')
  workspaceId: string,
) {
  return this.workspacesService.deleteWorkspace(
    workspaceId,
    user.id,
  );
}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(
    'manage_workspace',
  )
  async createWorkspace(
  @CurrentUser() user: {
    id: string;
    email: string;
  },
  @Body()
  dto: CreateWorkspaceDto,
) {
  return this.workspacesService.createWorkspace(
    dto,
  );
}
}