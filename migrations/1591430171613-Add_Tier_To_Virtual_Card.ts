import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTierToVirtualCard1591430171613 implements MigrationInterface {
    name = 'AddTierToVirtualCard1591430171613'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "PARTNER"
            ADD "DESCRIPTION" character varying(550)`, undefined);
        await queryRunner.query(`ALTER TABLE "VIRTUAL_CARD"
            ADD "TIER" text NOT NULL DEFAULT 'RUBIN'`, undefined);
        await queryRunner.query(`ALTER TABLE "VIRTUAL_CARD"
            ADD "EXPIRED_AT" TIMESTAMP`, undefined);
        await queryRunner.query(`ALTER TABLE "USER_PAYOUT"
            DROP COLUMN "ACCOUNT_NUMBER"`, undefined);
        await queryRunner.query(`ALTER TABLE "USER_PAYOUT"
            ADD "ACCOUNT_NUMBER" bigint NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "USER"
            DROP COLUMN "ACCOUNT_NUMBER"`, undefined);
        await queryRunner.query(`ALTER TABLE "USER"
            ADD "ACCOUNT_NUMBER" bigint`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "USER"
            DROP COLUMN "ACCOUNT_NUMBER"`, undefined);
        await queryRunner.query(`ALTER TABLE "USER"
            ADD "ACCOUNT_NUMBER" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "USER_PAYOUT"
            DROP COLUMN "ACCOUNT_NUMBER"`, undefined);
        await queryRunner.query(`ALTER TABLE "USER_PAYOUT"
            ADD "ACCOUNT_NUMBER" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "VIRTUAL_CARD"
            DROP COLUMN "EXPIRED_AT"`, undefined);
        await queryRunner.query(`ALTER TABLE "VIRTUAL_CARD"
            DROP COLUMN "TIER"`, undefined);
        await queryRunner.query(`ALTER TABLE "PARTNER"
            DROP COLUMN "DESCRIPTION"`, undefined);
    }

}
