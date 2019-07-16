import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TadeusTransformInterceptor } from "../../common/interceptors/tadeus-transform.interceptor";

@Module({
    imports: [],
    controllers: [],
    providers: [
        // {
        //     provide: APP_GUARD,
        //     useClass: RolesGuard,
        // },
        {
            provide: APP_INTERCEPTOR,
            useClass: TadeusTransformInterceptor
        }
    ],
})
export class ApiModule {
}
