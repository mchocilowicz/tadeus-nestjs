import { MigrationInterface, QueryRunner } from "typeorm";

export class PhonePrefixTable1567534960760 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "phone_prefix" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" character varying NOT NULL, "code" character varying NOT NULL, "maxLength" integer NOT NULL, CONSTRAINT "PK_7404f8caa4e9d1efcaf73bef457" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "phone_prefix"`);
    }

}
