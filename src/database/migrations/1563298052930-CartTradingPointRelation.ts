import { MigrationInterface, QueryRunner } from "typeorm";

export class CartTradingPointRelation1563298052930 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "cart" ADD "tradingPointId" uuid`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_38ddca5cd1d798f0d87665a4013" FOREIGN KEY ("tradingPointId") REFERENCES "trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_38ddca5cd1d798f0d87665a4013"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "tradingPointId"`);
    }

}
