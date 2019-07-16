import { MigrationInterface, QueryRunner } from "typeorm";

export class NgoTypeTable1563294391189 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "ngo_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_8b94228d0b45c99f6be06e4819a" UNIQUE ("name"), CONSTRAINT "PK_NGO_TYPE_ID" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "ngo_type"`);
    }

}
