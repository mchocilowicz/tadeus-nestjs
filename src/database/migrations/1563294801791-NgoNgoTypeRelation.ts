import { MigrationInterface, QueryRunner } from "typeorm";

export class NgoNgoTypeRelation1563294801791 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" ADD "typeId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD CONSTRAINT "FK_f6ac76288c787c507dd343a8751" FOREIGN KEY ("typeId") REFERENCES "ngo_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" DROP CONSTRAINT "FK_f6ac76288c787c507dd343a8751"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "typeId"`);
    }

}
