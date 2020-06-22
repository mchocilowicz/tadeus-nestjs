import {MigrationInterface, QueryRunner} from "typeorm";

export class DonationPersonalPoolFrequencyDashboard1592740374195 implements MigrationInterface {
    name = 'DonationPersonalPoolFrequencyDashboard1592740374195'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "SETTINGS" ADD "PERSONAL_POOL_FREQUENCY" integer NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "SETTINGS" ADD "DONATION_POOL_FREQUENCY" integer NOT NULL DEFAULT 0`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "SETTINGS" DROP COLUMN "DONATION_POOL_FREQUENCY"`, undefined);
        await queryRunner.query(`ALTER TABLE "SETTINGS" DROP COLUMN "PERSONAL_POOL_FREQUENCY"`, undefined);
    }

}
