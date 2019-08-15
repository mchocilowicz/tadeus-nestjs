import { MigrationInterface, QueryRunner } from "typeorm";

export class NgoAddPostCodeField1565878528436 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" ADD "postCode" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "postCode"`);
    }

}
