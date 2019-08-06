import { MigrationInterface, QueryRunner } from "typeorm";

export class UserStatusField1563908729864 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "blocked"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "status" text NOT NULL DEFAULT 'ACTIVE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "active" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "blocked" boolean NOT NULL`);
    }

}
