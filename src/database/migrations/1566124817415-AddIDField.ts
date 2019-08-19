import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIDField1566124817415 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "type" text NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "cardNumber" character varying NOT NULL, CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "trading_point_type" ADD "code" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ngo_type" ADD "code" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD "ID" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD "cardId" uuid`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD CONSTRAINT "UQ_23f39fb24310d90424710f5e266" UNIQUE ("cardId")`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "ID" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD CONSTRAINT "FK_23f39fb24310d90424710f5e266" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" DROP CONSTRAINT "FK_23f39fb24310d90424710f5e266"`);
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "ID"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP CONSTRAINT "UQ_23f39fb24310d90424710f5e266"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "cardId"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "ID"`);
        await queryRunner.query(`ALTER TABLE "ngo_type" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "trading_point_type" DROP COLUMN "code"`);
        await queryRunner.query(`DROP TABLE "card"`);
    }

}
