import { MigrationInterface, QueryRunner } from "typeorm";

export class TRPFields1569943387788 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" RENAME COLUMN "manipulationFee" TO "fee"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" RENAME COLUMN "fee" TO "manipulationFee"`);
    }

}
