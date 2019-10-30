import { MigrationInterface, QueryRunner } from "typeorm";

export class ConfigExpiration1572379256296 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."configuration" ADD "userExpirationAfterDays" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."configuration" DROP COLUMN "userExpirationAfterDays"`);
    }

}
