import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPointRenamingFields1565721685974 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.renameColumn("trading_point", "defaultDonationPercentage", 'donationPercentage');
        await queryRunner.renameColumn("trading_point", "defaultVat", 'vat');
        await queryRunner.query(`ALTER TABLE "trading_point" ALTER COLUMN "donationPercentage" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "trading_point" ALTER COLUMN "vat" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.renameColumn("trading_point", 'donationPercentage', "defaultDonationPercentage");
        await queryRunner.renameColumn("trading_point", 'vat', "defaultVat");
        await queryRunner.query(`ALTER TABLE "trading_point" ALTER COLUMN "defaultDonationPercentage" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "trading_point" ALTER COLUMN "defaultVat" TYPE integer`);
    }

}
