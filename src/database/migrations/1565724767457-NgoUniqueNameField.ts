import { MigrationInterface, QueryRunner } from "typeorm";

export class NgoUniqueNameField1565724767457 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" ADD CONSTRAINT "UQ_b16ce2feab21db61ee5db4ab498" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" DROP CONSTRAINT "UQ_b16ce2feab21db61ee5db4ab498"`);
    }

}
