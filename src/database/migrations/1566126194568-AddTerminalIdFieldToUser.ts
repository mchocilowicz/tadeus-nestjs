import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTerminalIdFieldToUser1566126194568 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ADD "terminalID" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "terminalID"`);
    }

}
