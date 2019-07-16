import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch()
export class TadeusExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(TadeusExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const logMessage = `${new Date()}: ${status}: ${request.url}: ${request.originalUrl}: ${JSON.stringify(request.body)}: ${JSON.stringify(exception)}`;
        this.logger.error(logMessage);

        if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
            let messageBody = exception instanceof HttpException ? exception.message : '';
            response
                .status(HttpStatus.OK)
                .json({
                    error: true,
                    message: messageBody.message
                });
        } else {
            response
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    error: true,
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    timestamp: new Date().toISOString(),
                    message: "Proszę skontaktować się z działem Obsługi."
                });
        }
    }

}
