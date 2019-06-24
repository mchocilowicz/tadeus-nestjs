import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Connection} from "typeorm";
import {RouterModule, Routes} from "nest-router";
import {ApiModule} from "../api/api.module";
import {DashboardModule} from "../dashboard/dashboard.module";

const routes: Routes = [
    {
        path: '/',
        module: DashboardModule,
    },
    {
        path: '/api',
        module: ApiModule
    }
];

@Module({
    imports: [
        RouterModule.forRoutes(routes),
        TypeOrmModule.forRoot(),
        ApiModule,
        DashboardModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    constructor(private readonly connection: Connection) {
        if (connection.isConnected) {
            console.log("Connected to database");
        }
    }

}
