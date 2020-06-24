import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientModule } from "./client/client.module";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { TadeusExceptionFilter } from "../common/filter/tadeus-exception.filter";
import { PartnerModule } from "./partner/partner.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { TadeusTransformInterceptor } from "../common/interceptors/tadeus-transform.interceptor";
import { SchedulersModule } from "../schedulers/schedulers.module";

@Module({
    imports: [TypeOrmModule.forRoot(), ClientModule, DashboardModule, SchedulersModule, PartnerModule],
    providers: [
        {
            provide: APP_FILTER,
            useClass: TadeusExceptionFilter
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TadeusTransformInterceptor
        }
    ],
})
export class AppModule {
}
