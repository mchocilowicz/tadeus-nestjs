import { Observable } from "rxjs";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map } from "rxjs/operators";
import { ResponseDto } from "../../dto/response.dto";

@Injectable()
export class TadeusTransformInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>> {
        return next.handle().pipe(map(data => new ResponseDto<T>(data)
        ));
    }
}
