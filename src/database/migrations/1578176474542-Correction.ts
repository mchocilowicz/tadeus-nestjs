import { MigrationInterface, QueryRunner } from "typeorm";

export class Correction1578176474542 implements MigrationInterface {
    name = 'Correction1578176474542';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."correction" DROP COLUMN "price"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" ADD "price" numeric NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" DROP COLUMN "transactionPrice"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" ADD "transactionPrice" numeric NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" DROP COLUMN "transactionPool"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" ADD "transactionPool" numeric NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" DROP COLUMN "pool"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" ADD "pool" numeric NOT NULL DEFAULT 0`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."correction" DROP COLUMN "pool"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" ADD "pool" integer NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" DROP COLUMN "transactionPool"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" ADD "transactionPool" integer NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" DROP COLUMN "transactionPrice"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" ADD "transactionPrice" integer NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" DROP COLUMN "price"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."correction" ADD "price" integer NOT NULL`, undefined);
    }

}
