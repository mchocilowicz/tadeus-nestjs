import { MigrationInterface, QueryRunner } from "typeorm";

export class VirtualCardTable1563293698987 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "virtual_card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "cardNumber" character varying NOT NULL, CONSTRAINT "PK_VIRTUAL_CARD_ID" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "virtual_card"`);
    }

}
