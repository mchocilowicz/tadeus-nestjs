import {MigrationInterface, QueryRunner} from "typeorm";

export class TableSchemav31579887300950 implements MigrationInterface {
    name = 'TableSchemav31579887300950'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD" DROP CONSTRAINT "FK_09f5ef59eaee7aa9834371c7ca9"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD" DROP CONSTRAINT "REL_09f5ef59eaee7aa9834371c7ca"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD" ADD CONSTRAINT "FK_09f5ef59eaee7aa9834371c7ca9" FOREIGN KEY ("PERIOD_SKID") REFERENCES "tds"."PERIOD"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD" DROP CONSTRAINT "FK_09f5ef59eaee7aa9834371c7ca9"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD" ADD CONSTRAINT "REL_09f5ef59eaee7aa9834371c7ca" UNIQUE ("PERIOD_SKID")`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD" ADD CONSTRAINT "FK_09f5ef59eaee7aa9834371c7ca9" FOREIGN KEY ("PERIOD_SKID") REFERENCES "tds"."PERIOD"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
