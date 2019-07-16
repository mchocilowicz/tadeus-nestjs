import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionTradingPointRelation1563296932861 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "tradingPointId" uuid`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_6f545a5b4c0adedb79f9baae2cf" FOREIGN KEY ("tradingPointId") REFERENCES "trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_6f545a5b4c0adedb79f9baae2cf"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "tradingPointId"`);
    }

}
