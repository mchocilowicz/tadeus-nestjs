import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule, Routes } from "nest-router";
import { join } from "path";
import { ClientModule } from "./client/client.module";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { TadeusExceptionFilter } from "../common/filter/tadeus-exception.filter";
import { PartnerModule } from "./partner/partner.module";
import { PartnerTransactionModule } from "./partner/transaction/partner-transaction.module";
import { PartnerTerminalModule } from "./partner/terminal/partner-terminal.module";
import { NgoModule } from "./client/ngo/ngo.module";
import { RegisterModule } from "./client/register/register.module";
import { PlaceModule } from "./client/place/place.module";
import { ScheduleModule } from "nest-schedule";
import { ConfigurationScheduler } from "../schedulers/configuration.scheduler";
import { DonationModule } from "./client/donation/donation.module";
import { DashboardNgoModule } from "./dashboard/ngo/dashboard-ngo.module";
import { TradingPointModule } from "./dashboard/trading-point/trading-point.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { StatsModule } from "./dashboard/stats/stats.module";
import { TadeusTransformInterceptor } from "../common/interceptors/tadeus-transform.interceptor";
import { InformationModule } from "./client/user/information.module";
import { OpinionModule } from "./client/opinion/opinion.module";
import { PayoutModule } from "./client/payout/payout.module";
import { PartnerSettingsModule } from "./partner/settings/partner-settings.module";
import {PartnerDonationModule} from "./partner/donation/partner-donation.module";
import {PartnerOpinionModule} from "./partner/opinion/partner-opinion.module";

const routes: Routes = [
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
            },
            {
                path: '/donation',
                module: DonationModule
            },
            {
                path: '/information',
                module: InformationModule
            },
            {
                path: '/opinion',
                module: OpinionModule
            },
            {
                path: '/payout',
                module: PayoutModule
            }
        ]
    },
    {
        path: '/partner',
        module: PartnerModule,
        children: [
            {
                path: '/transaction',
                module: PartnerTransactionModule
            },
            {
                path: '/terminal',
                module: PartnerTerminalModule
            },
            {
                path: '/settingss',
                module: PartnerSettingsModule
            },
            {
                path: '/donationn',
                module: PartnerDonationModule
            },
            {
                path: '/opinionn',
                module: PartnerOpinionModule
            }
        ]
    },
    {
        path: '/dashboard',
        module: DashboardModule,
        children: [
            {
                path: '/stats',
                module: StatsModule
            },

            //         {
            //             path: '/user',
            //             module: UserModule
            //         },
            {
                path: '/trading-point',
                module: TradingPointModule,
            },
            //         {
            //             path: '/configuration',
            //             module: ConfigurationModule
            //         },
            {
                path: '/ngo',
                module: DashboardNgoModule
            },
            //         {
            //             path: '/trading-point-type',
            //             module: TradingPointTypeModule
            //         },
            //         {
            //             path: '/ngo-type',
            //             module: NgoTypeModule
            //         }
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
                url: "postgres://postgres:marcin12@localhost:5432/tadeus",
                type: "postgres",
                ssl: false,
                schema: 'tds',
                entities: [
                    join(__dirname, "../../**/*.entity{.ts,.js}")
                ],
                synchronize: false,
                logging: true
            })
        }),
        //Client Module

        ClientModule,
        NgoModule,
        RegisterModule,
        PlaceModule,
        DonationModule,
        InformationModule,
        OpinionModule,

        //Partner Module

        PartnerModule,
        PartnerTransactionModule,
        PartnerTerminalModule,
        PartnerDonationModule,
        PartnerOpinionModule,
        PartnerSettingsModule,
        //Dashboard Module

        DashboardModule,
        // UserModule,
        TradingPointModule,
        // TradingPointTypeModule,
        // ConfigurationModule,
        DashboardNgoModule,
        // NgoTypeModule,
        StatsModule
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
        {
            provide: APP_INTERCEPTOR,
            useClass: TadeusTransformInterceptor
        },
        ConfigurationScheduler,
    ],
})
export class AppModule {
}
