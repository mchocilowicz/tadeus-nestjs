import { MigrationInterface, QueryRunner } from "typeorm";

export class UserTable1563290328671 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying, "name" character varying, "code" integer, "email" character varying, "collectedMoney" integer NOT NULL, "blocked" boolean NOT NULL, "registered" boolean NOT NULL, "active" boolean NOT NULL, "xp" integer NOT NULL, "donationPool" integer NOT NULL, "personalPool" integer NOT NULL, "ngoSelectionCount" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UNIQUE_USER_PHONE" UNIQUE ("phone"), CONSTRAINT "PK_USER_ID" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
