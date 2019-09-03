import { MigrationInterface, QueryRunner } from "typeorm";

export class PhonePrefixUniqueFields1567536708887 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "phone_prefix" ADD CONSTRAINT "UQ_c0442eb83e7bf910b7168fe2a30" UNIQUE ("value", "code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "phone_prefix" DROP CONSTRAINT "UQ_c0442eb83e7bf910b7168fe2a30"`);
    }

}
