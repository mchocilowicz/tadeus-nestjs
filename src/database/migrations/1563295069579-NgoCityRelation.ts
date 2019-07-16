import { MigrationInterface, QueryRunner } from "typeorm";

export class NgoCityRelation1563295069579 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" ADD "cityId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD CONSTRAINT "FK_3a1395d6b918f25d0f7cc042841" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ngo" DROP CONSTRAINT "FK_3a1395d6b918f25d0f7cc042841"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP COLUMN "cityId"`);
    }

}
