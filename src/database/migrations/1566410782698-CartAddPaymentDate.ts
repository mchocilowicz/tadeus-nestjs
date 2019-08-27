import { MigrationInterface, QueryRunner } from "typeorm";

export class CartAddPaymentDate1566410782698 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "cart" ADD "paymentDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "paymentDate"`);
    }

}
