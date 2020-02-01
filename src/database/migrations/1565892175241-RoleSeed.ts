import {MigrationInterface, QueryRunner} from "typeorm";

export class RoleSeed1565892175241 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "tds"."ROLE" ("SKID", "VALUE") VALUES (uuid_generate_v4(), 'CLIENT')`);
        await queryRunner.query(`INSERT INTO "tds"."ROLE" ("SKID", "VALUE") VALUES (uuid_generate_v4(), 'TERMINAL')`);
        await queryRunner.query(`INSERT INTO "tds"."ROLE" ("SKID", "VALUE") VALUES (uuid_generate_v4(), 'DASHBOARD')`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE FROM "tds"."ROLE" where "VALUE" = 'CLIENT'`);
        await queryRunner.query(`DELETE FROM "tds"."ROLE" where "VALUE" = 'TERMINAL'`);
        await queryRunner.query(`DELETE FROM "tds"."ROLE" where "VALUE" = 'DASHBOARD'`);
    }
}
