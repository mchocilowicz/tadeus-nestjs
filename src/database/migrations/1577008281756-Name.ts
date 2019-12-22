import { MigrationInterface, QueryRunner } from "typeorm";

export class Name1577008281756 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "prevName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "prevName"`);
    }

}
