import { MigrationInterface, QueryRunner } from "typeorm";

export class ConfigurationTableAddTypeField1565112061688 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "configuration" ADD "type" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "configuration" DROP COLUMN "type"`);
    }

}
