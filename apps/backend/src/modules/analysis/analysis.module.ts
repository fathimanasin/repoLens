import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AnalysisGateway } from './analysis.gateway';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [
    ConfigModule,
  ],

  providers: [
    AnalysisGateway,
    AnalysisService,
  ],

  exports: [
    AnalysisService,
  ],
})
export class AnalysisModule {}