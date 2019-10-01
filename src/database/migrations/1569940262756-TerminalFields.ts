import { MigrationInterface, QueryRunner } from "typeorm";

export class TerminalFields1569940262756 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_13ffb77adf62d91bbc297bcd167"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "donationId"`);
        await queryRunner.query(`ALTER TABLE "donation" ADD "price" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "terminal" ADD "phone" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "terminal" ADD "ID" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "terminal" DROP COLUMN "ID"`);
        await queryRunner.query(`ALTER TABLE "terminal" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "donationId" uuid`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_13ffb77adf62d91bbc297bcd167" FOREIGN KEY ("donationId") REFERENCES "donation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
