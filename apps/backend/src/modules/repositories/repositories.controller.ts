import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ConnectRepositoryDto } from './dto/connect-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';
import { RepositoriesService } from './repositories.service';


@Controller('repositories')
export class RepositoriesController {
  constructor(
    private readonly repositoriesService: RepositoriesService,
  ) {}

  @Get()
async findByWorkspace(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Query('workspaceId')
  workspaceId: string,
) {
  return this.repositoriesService.findByWorkspace(
    workspaceId,
    user.id,
  );
}

@Get(':repositoryId/dashboard')
async dashboard(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.getDashboard(
    repositoryId,
    user.id,
  );
}



@Get(':repositoryId/analyses')
async findAnalyses(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.findAnalyses(
    repositoryId,
    user.id,
  );
}

@Get(':repositoryId/analyses/:analysisId')
async findAnalysisById(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('repositoryId')
  repositoryId: string,

  @Param('analysisId')
  analysisId: string,
) {
  return this.repositoriesService.findAnalysisById(
    repositoryId,
    analysisId,
    user.id,
  );
}

@Get(':repositoryId/drift')
async findDriftEvents(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.findDriftEvents(
    repositoryId,
    user.id,
  );
}

@Get(':repositoryId/drift/:eventId')
async findDriftEventById(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('repositoryId')
  repositoryId: string,

  @Param('eventId')
  eventId: string,
) {
  return this.repositoriesService.findDriftEventById(
    repositoryId,
    eventId,
    user.id,
  );
}

@Get(':repositoryId')
async findOne(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.findById(
    repositoryId,
    user.id,
  );
}

@Patch(':repositoryId')
async update(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('repositoryId')
  repositoryId: string,

  @Body()
  dto: UpdateRepositoryDto,
) {
  return this.repositoriesService.updateRepository(
    repositoryId,
    user.id,
    dto,
  );
}

@Delete(':repositoryId')
async disconnect(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.disconnectRepository(
    repositoryId,
    user.id,
  );
}

@Post(':repositoryId/analyze')
async triggerAnalysis(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.triggerAnalysis(
    repositoryId,
    user.id,
  );
}


  @Post()
async connectRepository(
  @CurrentUser() user: {
    id: string;
    email: string;
  },

  @Body()
  dto: ConnectRepositoryDto,
) {
  return this.repositoriesService.connectRepository(
    user.id,
    dto,
  );
}



}