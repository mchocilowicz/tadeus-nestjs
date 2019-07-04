import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { loggers } from "winston";

@Catch()
export class TadeusExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(TadeusExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = `${new Date()}: ${status}: ${request.url}: ${request.originalUrl}: ${request.body}: ${exception}`;
        this.logger.error(message);
        response
            .status(status)
            .json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
    }

}
