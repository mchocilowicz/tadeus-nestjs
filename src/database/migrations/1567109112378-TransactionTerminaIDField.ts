import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionTerminaIDField1567109112378 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "terminalID" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "terminalID"`);
    }

}
