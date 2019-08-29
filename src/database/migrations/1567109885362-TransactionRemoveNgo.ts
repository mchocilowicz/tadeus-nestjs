import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionRemoveNgo1567109885362 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_c562ee6fa135794d3db641a7757"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "ngoId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "ngoId" uuid`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_c562ee6fa135794d3db641a7757" FOREIGN KEY ("ngoId") REFERENCES "ngo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
