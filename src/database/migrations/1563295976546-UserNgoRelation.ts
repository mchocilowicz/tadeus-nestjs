import { MigrationInterface, QueryRunner } from "typeorm";

export class UserNgoRelation1563295976546 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ADD "ngoId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_31307c270942a4468b1ac85cc49" FOREIGN KEY ("ngoId") REFERENCES "ngo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_31307c270942a4468b1ac85cc49"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "ngoId"`);
    }

}
