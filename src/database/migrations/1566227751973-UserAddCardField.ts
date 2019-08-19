import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAddCardField1566227751973 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_cba9059fbe9a2d01767cfa446cc"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "virtualCardId" TO "cardId"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "UQ_cba9059fbe9a2d01767cfa446cc" TO "UQ_de44ed71836e81c3fca3dc7fc5c"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_de44ed71836e81c3fca3dc7fc5c" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_de44ed71836e81c3fca3dc7fc5c"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "UQ_de44ed71836e81c3fca3dc7fc5c" TO "UQ_cba9059fbe9a2d01767cfa446cc"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "cardId" TO "virtualCardId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_cba9059fbe9a2d01767cfa446cc" FOREIGN KEY ("virtualCardId") REFERENCES "virtual_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
