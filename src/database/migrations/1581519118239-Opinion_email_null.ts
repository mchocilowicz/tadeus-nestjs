import { MigrationInterface, QueryRunner } from "typeorm";

export class OpinionEmailNull1581519118239 implements MigrationInterface {
    name = 'OpinionEmailNull1581519118239';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."OPINION"
            ALTER COLUMN "EMAIL" DROP NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."OPINION"
            ALTER COLUMN "EMAIL" SET NOT NULL`, undefined);
    }

}
