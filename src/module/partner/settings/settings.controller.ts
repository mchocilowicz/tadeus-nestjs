import { Body, Controller, Get, Put, Req } from "@nestjs/common";
import { Terminal } from "../../../database/entity/terminal.entity";
import { TradingPoint } from "../../../database/entity/trading-point.entity";

@Controller()
export class SettingsController {

    @Get()
    async getTradingPointSettings(@Req() req: any) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        return {
            defaultDonationPercent: point.donationPercentage,
            defaultReceipt: point.price,
        }
    }

    @Put()
    async updateTradingPointSettings(@Req() req: any, @Body() dto: { defaultDonationPercent: number, defaultReceipt: number }) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        point.donationPercentage = dto.defaultDonationPercent;
        point.price = dto.defaultReceipt;
        await point.save();
    }
}