import {MigrationInterface, QueryRunner} from "typeorm";

export class PhonePrefixSeed1567536389783 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "tds"."phone_prefix" ("id", "value", "code", "maxLength") VALUES (DEFAULT, 48, 'PL', 9)`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE FROM "tds"."phone_prefix" where code = 'PL'`)
    }

}
