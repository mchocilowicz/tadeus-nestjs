import { MigrationInterface, QueryRunner } from "typeorm";

export class UserMakeTerminalIDNullable1566225685474 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "terminalID" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "terminalID" SET NOT NULL`);
    }

}
