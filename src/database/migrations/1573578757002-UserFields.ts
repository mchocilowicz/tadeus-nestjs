import { MigrationInterface, QueryRunner } from "typeorm";

export class UserFields1573578757002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP CONSTRAINT "FK_7e02d86b39f8d14a6d3a6edcb6d"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "detailsId"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "xp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "lastName" character varying`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "bankAccount" integer`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "collectedMoney" numeric NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "ngoTempMoney" numeric NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "ngoSelectionCount" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "ngoId" uuid`);
        await queryRunner.query(`ALTER TABLE "tds"."city" DROP CONSTRAINT "UQ_b5ce1d1f964c97c77965f28fa68"`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo_type" DROP CONSTRAINT "UQ_909a0b7030ca288f8729b207e89"`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point_type" DROP CONSTRAINT "UQ_8aedab6701278ef800490164a5e"`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" DROP CONSTRAINT "UQ_b9b01d988aedccece4706890df9"`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" DROP CONSTRAINT "UQ_50e91dcc7d952a43ddb4b9163a6"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD CONSTRAINT "FK_77a07db98e0878549ce753b412d" FOREIGN KEY ("ngoId") REFERENCES "tds"."ngo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP CONSTRAINT "FK_77a07db98e0878549ce753b412d"`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" ADD CONSTRAINT "UQ_50e91dcc7d952a43ddb4b9163a6" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" ADD CONSTRAINT "UQ_b9b01d988aedccece4706890df9" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point_type" ADD CONSTRAINT "UQ_8aedab6701278ef800490164a5e" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo_type" ADD CONSTRAINT "UQ_909a0b7030ca288f8729b207e89" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "tds"."city" ADD CONSTRAINT "UQ_b5ce1d1f964c97c77965f28fa68" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "ngoId"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "ngoSelectionCount"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "ngoTempMoney"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "collectedMoney"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "bankAccount"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP COLUMN "xp"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD "detailsId" uuid`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD CONSTRAINT "FK_7e02d86b39f8d14a6d3a6edcb6d" FOREIGN KEY ("detailsId") REFERENCES "tds"."user_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
