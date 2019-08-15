import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPointVirtualDistanceField1565864675224 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "distance" numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "distance"`);
    }

}
