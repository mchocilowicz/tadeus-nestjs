import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule, Routes } from "nest-router";
import { join } from "path";
import { ApiModule } from "../api/api.module";
import { ClientModule } from "../client/client.module";
import { APP_FILTER } from "@nestjs/core";
import { TadeusExceptionFilter } from "../../common/filter/tadeus-exception.filter";
import { PartnerModule } from "../partner/partner.module";
import { DashboardModule } from "../dashboard/dashboard.module";

const routes: Routes = [
    {
        path: '/api',
        module: ApiModule,
        children: [
            {
                path: '/client',
                module: ClientModule
            },
            {
                path: '/partner',
                module: PartnerModule
            },
            {
                path: '/dashboard',
                module: DashboardModule
            }
        ]
    }
];

@Module({
    imports: [
        // MorganModule.forRoot(),
        RouterModule.forRoutes(routes),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                url: process.env.DATABASE_URL,
                type: "postgres",
                entities: [
                    join(__dirname, "../../**/*.entity{.ts,.js}")
                ],
                synchronize: false,
                logging: true
            })
        }),
        ApiModule,
        ClientModule,
        PartnerModule,
        DashboardModule,

    ],
    controllers: [],
    providers: [
        // {
        //     provide: APP_INTERCEPTOR,
        //     useClass: MorganInterceptor('combined')
        // },
        {
            provide: APP_FILTER,
            useClass: TadeusExceptionFilter
        }
    ],
})

export class AppModule {
}
