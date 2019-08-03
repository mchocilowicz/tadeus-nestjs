import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPointManipulationFeeAsDecimal1564428241282 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "manipulationFee"`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "manipulationFee" numeric NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "manipulationFee"`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "manipulationFee" integer NOT NULL`);
    }

}
