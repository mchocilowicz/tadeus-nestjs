import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPointCityRelation1563295877056 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "cityId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD CONSTRAINT "FK_aaf63b5e53db9679c62a151181e" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP CONSTRAINT "FK_aaf63b5e53db9679c62a151181e"`);
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "cityId"`);
    }

}
