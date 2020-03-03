import { MigrationInterface, QueryRunner } from "typeorm";

export class transactionNgo1583079337450 implements MigrationInterface {
    name = 'transactionNgo1583079337450';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ALTER COLUMN "USER_XP" SET DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ALTER COLUMN "PARTNER_XP" SET DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            DROP COLUMN "NGO_DONATION"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ADD "NGO_DONATION" numeric NOT NULL DEFAULT 0`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            DROP COLUMN "NGO_DONATION"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ADD "NGO_DONATION" integer NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ALTER COLUMN "PARTNER_XP" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ALTER COLUMN "USER_XP" DROP DEFAULT`, undefined);
    }

}
