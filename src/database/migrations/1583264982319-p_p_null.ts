import { MigrationInterface, QueryRunner } from "typeorm";

export class pPNull1583264982319 implements MigrationInterface {
    name = 'pPNull1583264982319';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD"
            ALTER COLUMN "SEND_MESSAGES_AT" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD"
            ALTER COLUMN "NOT_EDITABLE_AT" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD"
            ALTER COLUMN "CLOSED_AT" DROP NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD"
            ALTER COLUMN "CLOSED_AT" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD"
            ALTER COLUMN "NOT_EDITABLE_AT" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD"
            ALTER COLUMN "SEND_MESSAGES_AT" SET NOT NULL`, undefined);
    }

}
