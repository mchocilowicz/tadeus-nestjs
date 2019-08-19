import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentTable1566242272973 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "invoiceNumber" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "cartId" uuid, "tradingPointId" uuid, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "ID" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "donation" ADD "ID" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "donation" ADD "invoiceNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "donation" ADD "type" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "donation" ADD "price" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_6f5b708b8fd618ea78a9f10ccfe" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_380800b1d14b5f401521f5e4fb5" FOREIGN KEY ("tradingPointId") REFERENCES "trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_380800b1d14b5f401521f5e4fb5"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_6f5b708b8fd618ea78a9f10ccfe"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "donation" ADD "price" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "invoiceNumber"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "ID"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "ID"`);
        await queryRunner.query(`DROP TABLE "payment"`);
    }

}
