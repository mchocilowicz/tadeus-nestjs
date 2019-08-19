import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIDFieldToUser1566161142331 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "cardNumber"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "ID" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "closedDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "closedDate"`);
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "ID"`);
        await queryRunner.query(`ALTER TABLE "card" ADD "cardNumber" character varying NOT NULL`);
    }

}
