import {MigrationInterface, QueryRunner} from "typeorm";

export class TradingPointManipulationFeeField1563908392353 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "manipulationFee" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "manipulationFee"`);
    }

}
