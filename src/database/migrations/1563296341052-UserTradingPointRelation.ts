import { MigrationInterface, QueryRunner } from "typeorm";

export class UserTradingPointRelation1563296341052 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ADD "tradingPointId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_ba24fca234735238d1628dfa6c2" FOREIGN KEY ("tradingPointId") REFERENCES "trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_ba24fca234735238d1628dfa6c2"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tradingPointId"`);
    }

}
