import { MigrationInterface, QueryRunner } from "typeorm";

export class CartTransactionRelation1563298217150 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "cartId" uuid`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_2e98daa522db627daf36b26ccc3" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_2e98daa522db627daf36b26ccc3"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "cartId"`);
    }

}
