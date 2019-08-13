import { MigrationInterface, QueryRunner } from "typeorm";

export class ConfigurationChangeTypeToNumeric1565724428570 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "configuration" ALTER COLUMN "minNgoTransfer" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "configuration" ALTER COLUMN "minPersonalPool" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "configuration" ALTER COLUMN "minNgoTransfer" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "configuration" ALTER COLUMN "minPersonalPool" TYPE integer`);
    }

}
