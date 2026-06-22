import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
} from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { GithubModule } from './modules/github/github.module';
import { RepositoriesModule } from './modules/repositories/repositories.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';



@Module({
  imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  PrismaModule,
  AuthModule,
  OrganizationsModule,
  WorkspacesModule,
  GithubModule,
  RepositoriesModule,
  AnalysisModule,
],
   providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: PermissionsGuard,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: TransformInterceptor,
  },
  {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  },
],
})
export class AppModule {}
