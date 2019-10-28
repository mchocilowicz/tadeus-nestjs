import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentTable1572288002862 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "tds"."user_payout" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "accountNumber" character varying NOT NULL, "price" integer NOT NULL, "class" character varying NOT NULL DEFAULT 'PAYOUT', "userId" uuid, CONSTRAINT "PK_dd9a82d44a98871558510fef5d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD "class" character varying NOT NULL DEFAULT 'TRANSACTION'`);
        await queryRunner.query(`ALTER TABLE "tds"."user_payout" ADD CONSTRAINT "FK_5d32aba8500e6b273bcfe78e867" FOREIGN KEY ("userId") REFERENCES "tds"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."user_payout" DROP CONSTRAINT "FK_5d32aba8500e6b273bcfe78e867"`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP COLUMN "class"`);
        await queryRunner.query(`DROP TABLE "tds"."user_payout"`);
    }

}
