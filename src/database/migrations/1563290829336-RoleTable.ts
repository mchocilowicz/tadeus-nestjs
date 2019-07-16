import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleTable1563290829336 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UNIQUE_ROLE_NAME" UNIQUE ("name"), CONSTRAINT "PK_ROLE_ID" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
