import {MigrationInterface, QueryRunner} from "typeorm";

export class TableSchemaV5_1579952152968 implements MigrationInterface {
    name = 'TableSchemaV5_1579952152968'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT" DROP COLUMN "PAYMENT_AT"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT" ADD "PAYMENT_AT" TIMESTAMP`, undefined);
    }

}
