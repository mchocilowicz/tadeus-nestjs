import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleSeed1563298525344 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "role" (id, name) VALUES (uuid_generate_v4(), 'ADMIN')`);
        await queryRunner.query(`INSERT INTO "role" (id, name) VALUES (uuid_generate_v4(), 'CLIENT')`);
        await queryRunner.query(`INSERT INTO "role" (id, name) VALUES (uuid_generate_v4(), 'PARTNER')`);
        await queryRunner.query(`INSERT INTO "role" (id, name) VALUES (uuid_generate_v4(), 'ANONYMOUS')`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE FROM "role" where name = 'ADMIN'`);
        await queryRunner.query(`DELETE FROM "role" where name = 'CLIENT'`);
        await queryRunner.query(`DELETE FROM "role" where name = 'PARTNER'`);
        await queryRunner.query(`DELETE FROM "role" where name = 'ANONYMOUS'`);
    }

}
