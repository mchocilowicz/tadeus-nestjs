import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionTable1563296560109 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "price" integer NOT NULL, "donationPercentage" integer NOT NULL, "donationValue" integer NOT NULL, "recipeCode" character varying NOT NULL, "xp" integer NOT NULL, "isCorrection" boolean NOT NULL, "verifiedByUser" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_TRANSACTION_ID" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "transaction"`);
    }

}
