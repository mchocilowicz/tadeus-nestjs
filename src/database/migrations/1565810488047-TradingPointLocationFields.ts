import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPointLocationFields1565810488047 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "longitude" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "latitude" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "coordinate" geometry(Point,4326)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "coordinate"`);
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "location" character varying NOT NULL`);
    }

}
