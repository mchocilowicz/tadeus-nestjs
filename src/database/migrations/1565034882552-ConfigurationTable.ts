import { MigrationInterface, QueryRunner } from "typeorm";

export class ConfigurationTable1565034882552 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "configuration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "minNgoTransfer" integer NOT NULL, "minPersonalPool" integer NOT NULL, "currentClientPaymentDate" TIMESTAMP NOT NULL, "clientCycleDays" integer NOT NULL, "nextClientPaymentDate" TIMESTAMP NOT NULL, "currentPartnerPaymentDate" TIMESTAMP NOT NULL, "partnerCycleDays" integer NOT NULL, "nextPartnerPaymentDate" TIMESTAMP NOT NULL, "currentNgoPaymentDate" TIMESTAMP NOT NULL, "ngoCycleDays" integer NOT NULL, "nextNgoPaymentDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_03bad512915052d2342358f0d8b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "configuration"`);
    }

}
