import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {RouterModule, Routes} from "nest-router";
import {ClientModule} from "./client/client.module";
import {APP_FILTER, APP_INTERCEPTOR} from "@nestjs/core";
import {TadeusExceptionFilter} from "../common/filter/tadeus-exception.filter";
import {PartnerModule} from "./partner/partner.module";
import {PartnerTransactionModule} from "./partner/transaction/partner-transaction.module";
import {PartnerTerminalModule} from "./partner/terminal/partner-terminal.module";
import {NgoModule} from "./client/ngo/ngo.module";
import {RegisterModule} from "./client/register/register.module";
import {PlaceModule} from "./client/place/place.module";
import {DonationModule} from "./client/donation/donation.module";
import {DashboardNgoModule} from "./dashboard/ngo/dashboard-ngo.module";
import {TradingPointModule} from "./dashboard/trading-point/trading-point.module";
import {DashboardModule} from "./dashboard/dashboard.module";
import {StatsModule} from "./dashboard/stats/stats.module";
import {TadeusTransformInterceptor} from "../common/interceptors/tadeus-transform.interceptor";
import {InformationModule} from "./client/user/information.module";
import {OpinionModule} from "./client/opinion/opinion.module";
import {PayoutModule} from "./client/payout/payout.module";
import {PartnerSettingsModule} from "./partner/settings/partner-settings.module";
import {PartnerDonationModule} from "./partner/donation/partner-donation.module";
import {PartnerOpinionModule} from "./partner/opinion/partner-opinion.module";
import {ConfigurationModule} from "./dashboard/configuration/configuration.module";
import {SettlementModule} from "./dashboard/settlement/settlement.module";
import {ScheduleModule} from '@nestjs/schedule';
import {EventEmitter} from 'events';
import {NestEmitterModule} from "nest-emitter";
import {UserModule} from "./dashboard/user/user.module";
import {NgoTypeModule} from "./dashboard/ngo-type/ngo-type.module";
import {DashboardTransactionModule} from "./dashboard/transaction/transaction.module";

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
                path: '/settings',
                module: PartnerSettingsModule
            },
            {
                path: '/donation',
                module: PartnerDonationModule
            },
            {
                path: '/opinion',
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
                path: '/settlement',
                module: SettlementModule
            },
            //         {
            //             path: '/trading-point-type',
            //             module: TradingPointTypeModule
            //         },
            {
                path: '/ngo-type',
                module: NgoTypeModule
            },
            {
                path: '/transaction',
                module: DashboardTransactionModule
            }
        ]
    }
];

@Module({
    imports: [
        NestEmitterModule.forRoot(new EventEmitter()),
        ScheduleModule.forRoot(),
        RouterModule.forRoutes(routes),
        TypeOrmModule.forRoot(),
        //Client Module

        ClientModule,
        NgoModule,
        RegisterModule,
        PlaceModule,
        DonationModule,
        InformationModule,
        OpinionModule,
        PayoutModule,

        //Partner Module

        PartnerModule,
        PartnerTransactionModule,
        PartnerTerminalModule,
        PartnerDonationModule,
        PartnerOpinionModule,
        PartnerSettingsModule,
        //Dashboard Module

        DashboardModule,
        UserModule,
        TradingPointModule,
        // TradingPointTypeModule,
        ConfigurationModule,
        DashboardNgoModule,
        NgoTypeModule,
        StatsModule,
        SettlementModule,
        DashboardTransactionModule
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
        // PartnerPaymentScheduler
        // ConfigurationScheduler,
    ],
})
export class AppModule {
}
