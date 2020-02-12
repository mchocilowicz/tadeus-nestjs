import { MigrationInterface, QueryRunner } from "typeorm";

export class DonationNull1581539533358 implements MigrationInterface {
    name = 'DonationNull1581539533358';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            ALTER COLUMN "PAYMENT_NUMBER" DROP NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            ALTER COLUMN "PAYMENT_NUMBER" SET NOT NULL`, undefined);
    }

}
