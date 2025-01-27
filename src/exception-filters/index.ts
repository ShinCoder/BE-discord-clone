import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { CustomException } from 'src/exceptions';

@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = exception.getStatus();
    const customCode = exception.getCustomCode();

    response.status(statusCode).json({
      statusCode,
      customCode,
      message: exception.message
    });
  }
}
