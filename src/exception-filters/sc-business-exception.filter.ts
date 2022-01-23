import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import {
  ScBusinessException,
  ScBusinessExceptions,
} from '../exception/sc-business.exception';

@Catch(ScBusinessException)
export class ScBusinessExceptionFilter implements ExceptionFilter {
  catch(exception: ScBusinessException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === ScBusinessExceptions.RESTAURANT_DISABLED.code) {
      response.status(403).json({
        code: 403,
        message: exception.message,
      });
    }
  }
}
