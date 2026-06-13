import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T>
  implements
    NestInterceptor<
      T,
      {
        data: T;
        timestamp: string;
      }
    >
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{
    data: T;
    timestamp: string;
  }> {
    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp:
          new Date().toISOString(),
      })),
    );
  }
}