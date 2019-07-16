import { MigrationInterface, QueryRunner } from "typeorm";

export class NgoTable1563294605726 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "ngo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bankNumber" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying NOT NULL, "verified" boolean NOT NULL, "verificationDate" TIMESTAMP, "location" character varying NOT NULL, "name" character varying NOT NULL, "address" character varying NOT NULL, "totalDonation" integer, "lastDonation" integer, "creationDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_NGO_ID" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "ngo"`);
    }

}
