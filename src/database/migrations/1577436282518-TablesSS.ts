import {MigrationInterface, QueryRunner} from "typeorm";

export class TablesSS1577436282518 implements MigrationInterface {
    name = 'TablesSS1577436282518'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."user_payout" DROP COLUMN "price"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."user_payout" ADD "price" numeric NOT NULL DEFAULT 0`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."user_payout" DROP COLUMN "price"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."user_payout" ADD "price" integer NOT NULL`, undefined);
    }

}
