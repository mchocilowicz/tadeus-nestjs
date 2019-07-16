import { MigrationInterface, QueryRunner } from "typeorm";

export class DonationNgoRelation1563298379747 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "donation" ADD "ngoId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "donation" ADD CONSTRAINT "FK_507622b6c06ce0e57d33bc72a8c" FOREIGN KEY ("ngoId") REFERENCES "ngo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "donation" DROP CONSTRAINT "FK_507622b6c06ce0e57d33bc72a8c"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP COLUMN "ngoId"`);
    }

}
