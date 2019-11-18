import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { TadeusValidationException } from "../exceptions/TadeusValidation.exception";
import { ExcelException } from "../exceptions/excel.exception";

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

        const logMessage = `${ new Date() }: ${ status }: ${ request.method } - ${ request.url } :body = ${ JSON.stringify(request.body) } :params = ${ JSON.stringify(request.query) } : exception = ${ JSON.stringify(exception) }`;
        this.logger.error(logMessage);

        let responseObject;
        let responseStatus = HttpStatus.OK;
        if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
            let messageBody = exception instanceof HttpException ? exception.message : '';
            let messageResponse;
            if (exception instanceof TadeusValidationException) {
                messageResponse = request.polyglot.phrases[messageBody]
            } else if (exception instanceof ExcelException) {
                messageResponse = request.polyglot.t(messageBody.message, {row: messageBody.row})
            } else {
                messageResponse = request.polyglot.phrases[messageBody.message]
            }
            responseObject = {
                error: true,
                message: messageResponse
            }
        } else {
            responseStatus = HttpStatus.INTERNAL_SERVER_ERROR;
            responseObject = {
                error: true,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
                message: request.polyglot.phrases['internal_server_error']
            };
        }
        response
            .status(responseStatus)
            .json(responseObject)
    }
}
