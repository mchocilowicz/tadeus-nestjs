import {MigrationInterface, QueryRunner} from "typeorm";

export class TableSchemaV4_1579887659613 implements MigrationInterface {
    name = 'TableSchemaV4_1579887659613'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD" ADD "IS_CLOSED" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD" DROP COLUMN "IS_CLOSED"`, undefined);
    }

}
