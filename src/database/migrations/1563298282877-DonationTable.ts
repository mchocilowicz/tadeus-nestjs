import { MigrationInterface, QueryRunner } from "typeorm";

export class DonationTable1563298282877 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "donation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "price" integer NOT NULL, CONSTRAINT "PK_DONATION_ID" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "donation"`);
    }

}
