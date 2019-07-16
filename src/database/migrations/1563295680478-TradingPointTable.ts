import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPointTable1563295680478 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "trading_point" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "defaultDonationPercentage" integer NOT NULL, "defaultVat" integer NOT NULL, "defaultSell" integer NOT NULL, "location" character varying NOT NULL, "address" character varying NOT NULL, "postCode" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f00a3a5409e5f33c8c8db9af986" UNIQUE ("name"), CONSTRAINT "PK_TRADING_POINT_ID" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "trading_point"`);
    }

}
