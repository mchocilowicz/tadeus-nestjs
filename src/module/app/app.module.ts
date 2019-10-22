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
import { UserModule } from "../dashboard/user/user.module";
import { TradingPointModule } from "../dashboard/trading-point/trading-point.module";
import { TradingPointTypeModule } from "../dashboard/trading-point-type/trading-point-type.module";
import { ConfigurationModule } from "../dashboard/configuration/configuration.module";
import { DashboardNgoModule } from "../dashboard/ngo/dashboard-ngo.module";
import { NgoTypeModule } from "../dashboard/ngo-type/ngo-type.module";
import { TransactionModule } from "../partner/transaction/transaction.module";
import { TerminalModule } from "../partner/terminal/terminal.module";
import { NgoModule } from "../client/ngo/ngo.module";
import { RegisterModule } from "../client/register/register.module";
import { PlaceModule } from "../client/place/place.module";
import { ScheduleModule } from "nest-schedule";
import { ConfigurationScheduler } from "../../schedulers/configuration.scheduler";

const routes: Routes = [
    {
        path: '/api',
        module: ApiModule,
        children: [
            {
                path: '/client',
                module: ClientModule,
                children: [
                    {
                        path: '/ngo',
                        module: NgoModule
                    },
                    {
                        path: '/register',
                        module: RegisterModule
                    },
                    {
                        path: '/place',
                        module: PlaceModule
                    }
                ]
            },
            {
                path: '/partner',
                module: PartnerModule,
                children: [
                    {
                        path: '/transaction',
                        module: TransactionModule
                    },
                    {
                        path: '/terminal',
                        module: TerminalModule
                    }
                ]
            },
            {
                path: '/dashboard',
                module: DashboardModule,
                children: [
                    {
                        path: '/user',
                        module: UserModule
                    },
                    {
                        path: '/trading-point',
                        module: TradingPointModule,
                    },
                    {
                        path: '/configuration',
                        module: ConfigurationModule
                    },
                    {
                        path: '/ngo',
                        module: DashboardNgoModule
                    },
                    {
                        path: '/trading-point-type',
                        module: TradingPointTypeModule
                    },
                    {
                        path: '/ngo-type',
                        module: NgoTypeModule
                    }
                ]
            }
        ]
    }
];

@Module({
    imports: [
        ScheduleModule.register(),
        // MorganModule.forRoot(),
        RouterModule.forRoutes(routes),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                url: process.env.DATABASE_URL,
                type: "postgres",
                schema: 'tds',
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
        UserModule,
        TradingPointModule,
        TradingPointTypeModule,
        ConfigurationModule,
        DashboardNgoModule,
        NgoTypeModule,
        TransactionModule,
        TerminalModule,
        NgoModule,
        RegisterModule,
        PlaceModule

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
        },
        ConfigurationScheduler,
    ],
})

export class AppModule {
}
