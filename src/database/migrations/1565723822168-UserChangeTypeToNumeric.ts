import { MigrationInterface, QueryRunner } from "typeorm";

export class UserChangeTypeToNumeric1565723822168 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "collectedMoney" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "donationPool" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "personalPool" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "collectedMoney" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "donationPool" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "personalPool" TYPE integer`);
    }

}
