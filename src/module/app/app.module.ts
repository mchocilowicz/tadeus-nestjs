import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule, Routes } from "nest-router";
import { join } from "path";
import { ApiModule } from "../api/api.module";
import { ClientModule } from "../client/client.module";
import { APP_FILTER } from "@nestjs/core";
import { TadeusExceptionFilter } from "../../common/filter/tadeus-exception.filter";
import { UserModule } from "../dashboard/user/user.module";
import { TradingPointModule } from "../dashboard/trading-point/trading-point.module";
import { ConfigurationModule } from "../dashboard/configuration/configuration.module";
import { DashboardNgoModule } from "../dashboard/ngo/dashboard-ngo.module";
import { CityModule } from "../client/city/city.module";
import { RegisterModule } from "../client/register/register.module";
import { NgoModule } from "../client/ngo/ngo.module";
import { PlaceModule } from "../client/place/place.module";
import { TransactionModule } from "../partner/transaction/transaction.module";
import { PartnerModule } from "../partner/partner.module";
import { TerminalModule } from "../partner/terminal/terminal.module";
import { DashboardModule } from "../dashboard/dashboard.module";

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
                        path: '/city',
                        module: CityModule
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
                        module: TradingPointModule
                    },
                    {
                        path: '/configuration',
                        module: ConfigurationModule
                    },
                    {
                        path: '/ngo',
                        module: DashboardNgoModule
                    }
                ]
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
        NgoModule,
        CityModule,
        PlaceModule,
        RegisterModule,
        ClientModule,
        TransactionModule,
        UserModule,
        TradingPointModule,
        ConfigurationModule,
        DashboardNgoModule,
        PartnerModule,
        TerminalModule,
        DashboardModule
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
