import {MigrationInterface, QueryRunner} from "typeorm";

export class PhonePrefixSeed1567536389783 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "tds"."PHONE_PREFIX" ("SKID", "VALUE", "CODE", "MAX_LENGTH")
                                 VALUES (DEFAULT, 48, 'PL', 9)`)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE
                                 FROM "tds"."PHONE_PREFIX"
                                 where "CODE" = 'PL'`)
    }

}
