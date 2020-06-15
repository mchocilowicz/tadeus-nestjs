import { MigrationInterface, QueryRunner } from "typeorm";

export class BankAccountAsString1592238113445 implements MigrationInterface {
    name = 'BankAccountAsString1592238113445'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "USER_PAYOUT"
            DROP COLUMN "ACCOUNT_NUMBER"`, undefined);
        await queryRunner.query(`ALTER TABLE "USER_PAYOUT"
            ADD "ACCOUNT_NUMBER" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "USER"
            DROP COLUMN "ACCOUNT_NUMBER"`, undefined);
        await queryRunner.query(`ALTER TABLE "USER"
            ADD "ACCOUNT_NUMBER" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "NGO"
            DROP COLUMN "BANK_ACCOUNT"`, undefined);
        await queryRunner.query(`ALTER TABLE "NGO"
            ADD "BANK_ACCOUNT" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "NGO"
            DROP COLUMN "BANK_ACCOUNT"`, undefined);
        await queryRunner.query(`ALTER TABLE "NGO"
            ADD "BANK_ACCOUNT" bigint NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "USER"
            DROP COLUMN "ACCOUNT_NUMBER"`, undefined);
        await queryRunner.query(`ALTER TABLE "USER"
            ADD "ACCOUNT_NUMBER" bigint`, undefined);
        await queryRunner.query(`ALTER TABLE "USER_PAYOUT"
            DROP COLUMN "ACCOUNT_NUMBER"`, undefined);
        await queryRunner.query(`ALTER TABLE "USER_PAYOUT"
            ADD "ACCOUNT_NUMBER" bigint NOT NULL`, undefined);
    }

}
