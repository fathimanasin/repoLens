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