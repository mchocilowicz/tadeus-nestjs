import { MigrationInterface, QueryRunner } from "typeorm";

export class NgoVirtualDistanceField1565865756834 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" ADD "distance" integer`);
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "distance"`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "distance" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "trading_point" DROP COLUMN "distance"`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD "distance" numeric`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "distance"`);
    }

}
