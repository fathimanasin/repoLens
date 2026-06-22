import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AnalysisProgressEvent {
  repositoryId: string;
  stage: string;
  percent: number;
  message: string;
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(
    AnalysisService.name,
  );

  constructor(
    private readonly configService: ConfigService,
  ) {}

  getWorkerUrl(): string {
    return this.configService.get<string>(
      'ANALYSIS_WORKER_URL',
      'http://analysis-worker:8001',
    );
  }
}