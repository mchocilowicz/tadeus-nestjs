import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPointRemoveDefaultSellField1564427532407 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "defaultSell"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "defaultSell" integer NOT NULL`);
    }

}
