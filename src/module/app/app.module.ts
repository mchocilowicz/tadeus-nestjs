import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from "typeorm";
import { RouterModule, Routes } from "nest-router";
import { DashboardModule } from "../mvc/dashboard.module";
import { NgoModule } from "../ngo/ngo.module";
import { LoginModule } from "../login/login.module";
import { RegisterModule } from "../register/register.module";
import { CityModule } from "../city/city.module";
import { PlaceModule } from "../place/place.module";
import { join } from "path";
import { ApiModule } from "../api/api.module";
import { ClientModule } from "../client/client.module";
import { TransactionModule } from "../transaction/transaction.module";
import { APP_FILTER } from "@nestjs/core";
import { TadeusExceptionFilter } from "../../common/filter/tadeus-exception.filter";

const routes: Routes = [
    {
        path: '/',
        module: DashboardModule,
    },
    {
        path: '/api',
        module: ApiModule,
        children: [
            {
                path: '/ngo',
                module: NgoModule
            },
            {
                path: '/login',
                module: LoginModule,
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
            },
            {
                path: '/client',
                module: ClientModule
            },
            {
                path: '/transaction',
                module: TransactionModule
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
        DashboardModule,
        NgoModule,
        CityModule,
        LoginModule,
        PlaceModule,
        RegisterModule,
        ClientModule,
        TransactionModule,
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
    constructor(private readonly connection: Connection) {
    }
}
