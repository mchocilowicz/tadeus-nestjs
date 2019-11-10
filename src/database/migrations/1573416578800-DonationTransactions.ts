import {MigrationInterface, QueryRunner} from "typeorm";

export class DonationTransactions1573416578800 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD "donationId" uuid`);
        await queryRunner.query(`ALTER TABLE "tds"."virtual_card" ALTER COLUMN "donationPool" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."virtual_card" ALTER COLUMN "personalPool" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD CONSTRAINT "FK_db295f5979743cef102e7508ac3" FOREIGN KEY ("donationId") REFERENCES "tds"."donation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP CONSTRAINT "FK_db295f5979743cef102e7508ac3"`);
        await queryRunner.query(`ALTER TABLE "tds"."virtual_card" ALTER COLUMN "personalPool" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tds"."virtual_card" ALTER COLUMN "donationPool" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP COLUMN "donationId"`);
    }

}
