import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: HttpException,
    host: ArgumentsHost,
  ) {
    const ctx =
      host.switchToHttp();

    const response =
      ctx.getResponse();

    const request =
      ctx.getRequest();

    const status =
      exception.getStatus();

    const exceptionResponse =
      exception.getResponse();

    const message =
      typeof exceptionResponse ===
        'object' &&
      exceptionResponse !== null
        ? (
            exceptionResponse as Record<
              string,
              unknown
            >
          )['message'] ??
          exception.message
        : exception.message;

    response.status(status).json({
      statusCode: status,
      message,
      timestamp:
        new Date().toISOString(),
      path: request.url,
    });
  }
}