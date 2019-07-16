import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPointTradingPointTypeRelation1563295792881 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "typeId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD CONSTRAINT "FK_f7e61f50f55ba758ccb7159412e" FOREIGN KEY ("typeId") REFERENCES "trading_point_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP CONSTRAINT "FK_f7e61f50f55ba758ccb7159412e"`);
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "typeId"`);
    }

}
