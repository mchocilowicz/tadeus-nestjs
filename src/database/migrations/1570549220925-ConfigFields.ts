import { MigrationInterface, QueryRunner } from "typeorm";

export class ConfigFields1570549220925 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "configuration" ADD "oldClientPaymentDate" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "configuration" ADD "oldPartnerPaymentDate" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "configuration" ADD "oldNgoPaymentDate" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "configuration" DROP COLUMN "oldNgoPaymentDate"`);
        await queryRunner.query(`ALTER TABLE "configuration" DROP COLUMN "oldPartnerPaymentDate"`);
        await queryRunner.query(`ALTER TABLE "configuration" DROP COLUMN "oldClientPaymentDate"`);
    }

}
