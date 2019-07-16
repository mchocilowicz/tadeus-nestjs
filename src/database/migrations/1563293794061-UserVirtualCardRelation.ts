import { MigrationInterface, QueryRunner } from "typeorm";

export class UserVirtualCardRelation1563293794061 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ADD "virtualCardId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_cba9059fbe9a2d01767cfa446cc" UNIQUE ("virtualCardId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_cba9059fbe9a2d01767cfa446cc" FOREIGN KEY ("virtualCardId") REFERENCES "virtual_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_cba9059fbe9a2d01767cfa446cc"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_cba9059fbe9a2d01767cfa446cc"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "virtualCardId"`);
    }

}
