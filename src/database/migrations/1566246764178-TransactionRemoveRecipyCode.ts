import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionRemoveRecipyCode1566246764178 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "recipeCode"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "recipeCode" character varying NOT NULL`);
    }

}
