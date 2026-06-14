import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ConnectRepositoryDto } from './dto/connect-repository.dto';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
export class RepositoriesController {
  constructor(
    private readonly repositoriesService: RepositoriesService,
  ) {}

  @Get()
async findByWorkspace(
  @Query('workspaceId')
  workspaceId: string,
) {
  return this.repositoriesService.findByWorkspace(
    workspaceId,
  );
}

@Get(':repositoryId/dashboard')
async dashboard(
  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.getDashboard(
    repositoryId,
  );
}



@Get(':repositoryId/analyses')
async findAnalyses(
  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.findAnalyses(
    repositoryId,
  );
}

@Get(':repositoryId/analyses/:analysisId')
async findAnalysisById(
  @Param('repositoryId')
  repositoryId: string,

  @Param('analysisId')
  analysisId: string,
) {
  return this.repositoriesService.findAnalysisById(
    repositoryId,
    analysisId,
  );
}

@Get(':repositoryId/drift')
async findDriftEvents(
  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.findDriftEvents(
    repositoryId,
  );
}

@Get(':repositoryId/drift/:eventId')
async findDriftEventById(
  @Param('repositoryId')
  repositoryId: string,

  @Param('eventId')
  eventId: string,
) {
  return this.repositoriesService.findDriftEventById(
    repositoryId,
    eventId,
  );
}

@Get(':repositoryId')
async findOne(
  @Param('repositoryId')
  repositoryId: string,
) {
  return this.repositoriesService.findById(
    repositoryId,
  );
}


  @Post()
  async connectRepository(
    @Body()
    dto: ConnectRepositoryDto,
  ) {
    return this.repositoriesService.connectRepository(
      dto,
    );
  }
}