import { Controller, Get } from "@nestjs/common";
import { createQueryBuilder } from "typeorm";
import { DonationEnum } from "../../../common/enum/donation.enum";
import { Donation } from "../../../database/entity/donation.entity";

const _ = require('lodash');
const moment = require('moment');

@Controller()
export class ReportController {

    @Get('ngo')
    async getNgoReport() {
        let ngo: any[] = await createQueryBuilder('Ngo', 'ngo')
            .leftJoinAndSelect('ngo.donations', 'donation')
            .leftJoinAndSelect('donation.user', 'user')
            .leftJoinAndSelect('donation.tradingPoint', 'tradingPoint')
            .where('donation.type = :type', {type: DonationEnum.NGO})
            .getMany();

        let a: object[] = [];

        ngo.forEach((n: any) => {
            let donations = n.donations;
            let sortedDonations = _.sort(donations, 'createdAt');
            if (donations.length > 0) {
                let lastDonation = sortedDonations[sortedDonations.length - 1];
                let lastDate = moment(lastDonation.createdAt).format('YYYY-MM');
                let firstDate = moment(sortedDonations[0].createdAt).format('YYYY-MM');

                while (moment(firstDate).isSameOrAfter(lastDate)) {
                    let z = donations.find((d: Donation) => moment(d.createdAt).format('YYYY-MM') == firstDate);
                    if (z.length > 0) {
                        a.push({
                            name: n.name,
                            ID: n.ID,
                            users: _.uniqBy(z, 'user').length,
                            price: _.reduce(z, (sum: number, p: Donation) => sum + p.price, 0)
                        })
                    }
                    firstDate = moment(firstDate).subtract(1, 'months').format('YYYY-MM')
                }
            }
        });
        return a;
    }
}
