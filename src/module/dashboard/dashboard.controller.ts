import {Controller, Get, Render} from '@nestjs/common';

@Controller()
export class DashboardController {

    @Get()
    @Render('index')
    index() {
    }
}
