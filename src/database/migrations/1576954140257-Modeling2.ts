import { MigrationInterface, QueryRunner } from "typeorm";

export class Modeling21576954140257 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP COLUMN "class"`);
        await queryRunner.query(`ALTER TABLE "tds"."user_payout" DROP COLUMN "class"`);
        await queryRunner.query(`ALTER TABLE "tds"."opinion" ADD "tradingPointId" uuid`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" ADD "price" numeric NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD "donationPool" numeric NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD "personalPool" numeric NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "price" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "donationPercentage" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "provisionPercentage" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "paymentValue" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "vat" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "provision" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "poolValue" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."opinion" ADD CONSTRAINT "FK_db5a5a294ba7bb3d0067938d344" FOREIGN KEY ("tradingPointId") REFERENCES "tds"."trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."opinion" DROP CONSTRAINT "FK_db5a5a294ba7bb3d0067938d344"`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "poolValue" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "provision" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "vat" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "paymentValue" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "provisionPercentage" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "donationPercentage" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ALTER COLUMN "price" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP COLUMN "personalPool"`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP COLUMN "donationPool"`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "tds"."opinion" DROP COLUMN "tradingPointId"`);
        await queryRunner.query(`ALTER TABLE "tds"."user_payout" ADD "class" character varying NOT NULL DEFAULT 'PAYOUT'`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD "class" character varying NOT NULL DEFAULT 'TRANSACTION'`);
    }

}
