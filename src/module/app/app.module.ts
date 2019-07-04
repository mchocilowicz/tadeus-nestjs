import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from "typeorm";
import { RouterModule, Routes } from "nest-router";
import { DashboardModule } from "../dashboard/dashboard.module";
import { NgoModule } from "../ngo/ngo.module";
import { AuthModule } from "../auth/auth.module";
import { RegisterModule } from "../register/register.module";
import { CityModule } from "../city/city.module";
import { PlaceModule } from "../place/place.module";
import { MorganInterceptor, MorganModule } from "nest-morgan";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { TadeusExceptionFilter } from "../../common/filter/exception.filter";
import { join } from "path";

const routes: Routes = [
    {
        path: '/',
        module: DashboardModule,
    },
    {
        path: '/api',
        children: [
            {
                path: '/ngo',
                module: NgoModule
            },
            {
                path: '/login',
                module: AuthModule,
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
    }
];

@Module({
    imports: [
        MorganModule.forRoot(),
        RouterModule.forRoutes(routes),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                // extra: {
                //     ssl: true
                // },
                url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:6543/tadeus",
                type: "postgres",
                entities: [
                    join(__dirname,"../../**/*.entity{.ts,.js}")
                ],
                synchronize: true,
                logging: true
            })
        }),
        DashboardModule,
        NgoModule,
        CityModule,
        AuthModule,
        PlaceModule,
        RegisterModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: MorganInterceptor('combined')
        },
        // {
        //     provide: APP_FILTER,
        //     useClass: TadeusExceptionFilter
        // }
    ],
})

export class AppModule {
    constructor(private readonly connection: Connection) {

    }

}
