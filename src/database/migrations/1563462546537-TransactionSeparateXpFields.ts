import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionSeparateXpFields1563462546537 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "xp"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "userXp" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "tradingPointXp" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "xp" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "xp"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "tradingPointXp"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "userXp"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "xp" integer NOT NULL`);
    }

}
