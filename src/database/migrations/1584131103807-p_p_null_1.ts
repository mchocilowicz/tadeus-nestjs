import { MigrationInterface, QueryRunner } from "typeorm";

export class pPNull11584131103807 implements MigrationInterface {
    name = 'pPNull11584131103807';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            ADD "NGO_PAYOUTT_SKID" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD"
            ALTER COLUMN "IS_EDITABLE" SET DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            ADD CONSTRAINT "FK_196c9cde14c56849534026ac319" FOREIGN KEY ("NGO_PAYOUTT_SKID") REFERENCES "tds"."NGO_PAYOUT" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            DROP CONSTRAINT "FK_196c9cde14c56849534026ac319"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD"
            ALTER COLUMN "IS_EDITABLE" SET DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            DROP COLUMN "NGO_PAYOUTT_SKID"`, undefined);
    }

}
