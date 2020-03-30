import { MigrationInterface, QueryRunner } from "typeorm";

export class pPNull31585595955692 implements MigrationInterface {
    name = 'pPNull31585595955692';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."NGO_PAYOUT"
            ADD "PAYMENT_DETAILS" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."NGO_PAYOUT"
            DROP COLUMN "PAYMENT_DETAILS"`, undefined);
    }

}
