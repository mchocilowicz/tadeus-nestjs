import {MigrationInterface, QueryRunner} from "typeorm";

export class TransactionStatus1579000350183 implements MigrationInterface {
    name = 'TransactionStatus1579000350183'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD "status" text NOT NULL DEFAULT 'WAITING'`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD "correctionId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD CONSTRAINT "UQ_c149a7a3d1be95e7e6f96fffa4a" UNIQUE ("correctionId")`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD CONSTRAINT "FK_c149a7a3d1be95e7e6f96fffa4a" FOREIGN KEY ("correctionId") REFERENCES "tds"."transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP CONSTRAINT "FK_c149a7a3d1be95e7e6f96fffa4a"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP CONSTRAINT "UQ_c149a7a3d1be95e7e6f96fffa4a"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP COLUMN "correctionId"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP COLUMN "status"`, undefined);
    }

}
