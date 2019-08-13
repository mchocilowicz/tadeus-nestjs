import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionChangeTypeToNumeric1565722447332 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "donationPercentage" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "donationValue" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "price" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "donationPercentage" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "donationValue" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "price" TYPE integer`);
    }

}
