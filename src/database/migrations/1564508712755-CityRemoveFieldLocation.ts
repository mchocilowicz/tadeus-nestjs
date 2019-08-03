import { MigrationInterface, QueryRunner } from "typeorm";

export class CityRemoveFieldLocation1564508712755 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "location"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "city" ADD "location" character varying NOT NULL`);
    }

}
