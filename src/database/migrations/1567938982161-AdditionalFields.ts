import { MigrationInterface, QueryRunner } from "typeorm";

export class AdditionalFields1567938982161 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "donation" ADD "pool" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "donation" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "terminalCode" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "dashboardCode" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "terminalToken" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "dashboardToken" character varying`);
        await queryRunner.query(`ALTER TABLE "cart" ADD "price" numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "dashboardToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "terminalToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "dashboardCode"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "terminalCode"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "pool"`);
    }

}
