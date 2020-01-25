import {MigrationInterface, QueryRunner} from "typeorm";

export class TableSchemav21579885783129 implements MigrationInterface {
    name = 'TableSchemav21579885783129'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" ADD "PAYMENT_NUMBER" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."SETTINGS" ADD "USER_PERIOD_INTERVAL" integer NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."SETTINGS" DROP COLUMN "USER_PERIOD_INTERVAL"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" DROP COLUMN "PAYMENT_NUMBER"`, undefined);
    }

}
