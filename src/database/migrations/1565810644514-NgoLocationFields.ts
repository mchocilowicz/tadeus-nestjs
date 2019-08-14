import { MigrationInterface, QueryRunner } from "typeorm";

export class NgoLocationFields1565810644514 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD "longitude" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD "latitude" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD "coordinate" geometry(Point,4326)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "coordinate"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD "location" character varying NOT NULL`);
    }

}
