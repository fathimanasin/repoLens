import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { ConnectRepositoryDto } from './dto/connect-repository.dto';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
export class RepositoriesController {
  constructor(
    private readonly repositoriesService: RepositoriesService,
  ) {}

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