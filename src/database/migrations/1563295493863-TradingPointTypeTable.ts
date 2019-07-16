import { MigrationInterface, QueryRunner } from "typeorm";

export class TradingPointTypeTable1563295493863 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "trading_point_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_ebbc1668061227fb523e00f6b3b" UNIQUE ("name"), CONSTRAINT "PK_TRADING_POINT_TYPE_ID" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "trading_point_type"`);
    }

}
