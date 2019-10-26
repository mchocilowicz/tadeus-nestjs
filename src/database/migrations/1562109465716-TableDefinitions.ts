import { MigrationInterface, QueryRunner } from "typeorm";

export class TableDefinitions1562109465716 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "tds"."role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, CONSTRAINT "UQ_e0ec7232270d164c5ab4210a13f" UNIQUE ("value"), CONSTRAINT "PK_db8397a4b1293eec017c6a5c757" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."trading_point_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "UQ_8aedab6701278ef800490164a5e" UNIQUE ("name"), CONSTRAINT "PK_25eeb422c64515a27a32a273a03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."ngo_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "code" SERIAL NOT NULL, CONSTRAINT "UQ_909a0b7030ca288f8729b207e89" UNIQUE ("name"), CONSTRAINT "PK_3294cd43c250fb8a1f34f9a4b73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."donation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ID" character varying NOT NULL, "invoiceNumber" character varying, "type" text NOT NULL, "pool" text NOT NULL, "price" numeric NOT NULL, "isPaid" boolean NOT NULL DEFAULT false, "payedAt" TIMESTAMP, "ngoId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_228d950dccac8c23f879be433eb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."user_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "xp" integer NOT NULL DEFAULT 0, "name" character varying, "email" character varying, "lastName" character varying, "bankAccount" integer, "collectedMoney" numeric NOT NULL DEFAULT 0, "ngoTempMoney" numeric NOT NULL DEFAULT 0, "ngoSelectionCount" integer NOT NULL DEFAULT 0, "ngoId" uuid, CONSTRAINT "PK_f035c89d623b6b1d2e777eee549" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."physical_card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ID" character varying NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "collectedMoney" numeric NOT NULL DEFAULT 0, CONSTRAINT "PK_ad686116b29da9e212dc1be4120" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."phone_prefix" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "code" character varying NOT NULL, "maxLength" integer NOT NULL, CONSTRAINT "UQ_a9a417f39acfdaa70798508cb7d" UNIQUE ("value"), CONSTRAINT "PK_36dbe128012c75ca4f2239b80cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."terminal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "step" text, "ID" character varying NOT NULL, "isMain" boolean NOT NULL DEFAULT false, "phoneId" uuid, "tradingPointId" uuid, CONSTRAINT "PK_b517cc4dc31a52b41ad96713833" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."phone" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "prefixId" uuid, CONSTRAINT "UQ_1bfae5568210688a61ef1735615" UNIQUE ("value"), CONSTRAINT "UQ_1bfae5568210688a61ef1735615" UNIQUE ("value"), CONSTRAINT "PK_a8d8348ba9b757831b644376ce6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."ngo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ID" character varying NOT NULL, "bankNumber" character varying NOT NULL, "email" character varying NOT NULL, "verified" boolean NOT NULL, "verifiedAt" TIMESTAMP, "longitude" numeric NOT NULL, "latitude" numeric NOT NULL, "distance" integer, "coordinate" geometry(Point,4326), "name" character varying NOT NULL, "longName" character varying NOT NULL, "description" character varying(550) NOT NULL, "image" character varying, "thumbnail" character varying, "isTadeus" boolean NOT NULL, "address" character varying NOT NULL, "postCode" character varying NOT NULL, "totalDonation" integer, "lastDonation" integer, "phoneId" uuid, "cardId" uuid, "cityId" uuid, "typeId" uuid, CONSTRAINT "UQ_50e91dcc7d952a43ddb4b9163a6" UNIQUE ("name"), CONSTRAINT "REL_91a7cd89e4c301fb7bec619b3b" UNIQUE ("cardId"), CONSTRAINT "PK_236c91786e36351fb31a46e3c76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."city" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "UQ_b5ce1d1f964c97c77965f28fa68" UNIQUE ("name"), CONSTRAINT "PK_fcbb70e3aa0b9fa0ffefd95deb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ID" character varying NOT NULL, "invoiceNumber" character varying NOT NULL, "cartId" uuid, "tradingPointId" uuid, CONSTRAINT "PK_6fc08911033227befc2e3a5bf62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."cart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isPaid" boolean NOT NULL DEFAULT false, "price" numeric, "paymentDate" TIMESTAMP, "tradingPointId" uuid, CONSTRAINT "PK_9e128ddc382b7a44e9c162cfc87" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."trading_point" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ID" character varying NOT NULL, "name" character varying NOT NULL, "donationPercentage" numeric NOT NULL, "vat" numeric NOT NULL, "fee" numeric NOT NULL, "image" character varying, "longitude" numeric NOT NULL, "latitude" numeric NOT NULL, "address" character varying NOT NULL, "postCode" character varying NOT NULL, "xp" integer NOT NULL, "distance" integer, "coordinate" geometry(Point,4326), "active" boolean NOT NULL DEFAULT false, "closedAt" TIMESTAMP, "typeId" uuid NOT NULL, "phoneId" uuid, "cityId" uuid, CONSTRAINT "UQ_b9b01d988aedccece4706890df9" UNIQUE ("name"), CONSTRAINT "PK_f28493fededb1bcebe3abed2875" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ID" character varying NOT NULL, "price" numeric NOT NULL, "donationPercentage" numeric NOT NULL, "donationValue" numeric NOT NULL, "userXp" integer NOT NULL, "tradingPointXp" integer NOT NULL, "isCorrection" boolean NOT NULL, "verifiedByUser" boolean NOT NULL, "cartId" uuid, "tradingPointId" uuid, "userId" uuid, "terminalId" uuid, CONSTRAINT "PK_baee4fc73dbbb6168138ca40e8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."virtual_card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ID" character varying NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "donationPool" numeric NOT NULL, "personalPool" numeric NOT NULL, CONSTRAINT "PK_a16f5c2c316ce652ef14e664b0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."opinion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "email" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_4e3bc119daadf99d395159aeeb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_da855be6cd80d059a4baf8f2b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "registered" boolean NOT NULL DEFAULT false, "isAnonymous" boolean NOT NULL DEFAULT false, "terminalId" uuid, "detailsId" uuid, "cardId" uuid, "phoneId" uuid, CONSTRAINT "REL_42ddc5d1ddbe9087e5af084148" UNIQUE ("cardId"), CONSTRAINT "PK_4e8f28d38026a467c075730674e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ID" character varying NOT NULL, "code" integer, "token" character varying, "status" text NOT NULL DEFAULT 'ACTIVE', "roleId" uuid NOT NULL, "userId" uuid, CONSTRAINT "PK_caf48f6fb2d3f06fe7b00554148" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tds"."configuration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "minNgoTransfer" numeric NOT NULL, "minPersonalPool" numeric NOT NULL, "oldClientPaymentAt" TIMESTAMP NOT NULL, "previousClientPaymentAt" TIMESTAMP NOT NULL, "currentClientPaymentAt" TIMESTAMP NOT NULL, "clientInterval" integer NOT NULL, "oldPartnerPaymentAt" TIMESTAMP NOT NULL, "previousPartnerPaymentAt" TIMESTAMP NOT NULL, "currentPartnerPaymentAt" TIMESTAMP NOT NULL, "partnerInterval" integer NOT NULL, "oldNgoPaymentAt" TIMESTAMP NOT NULL, "previousNgoPaymentAt" TIMESTAMP NOT NULL, "currentNgoPaymentAt" TIMESTAMP NOT NULL, "ngoInterval" integer NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_04229e1535f1bf6f3b299300373" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tds"."donation" ADD CONSTRAINT "FK_f7a32e3c9838b53aed8d8d6ca6c" FOREIGN KEY ("ngoId") REFERENCES "tds"."ngo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."donation" ADD CONSTRAINT "FK_4371365fb9333b231d98695a88c" FOREIGN KEY ("userId") REFERENCES "tds"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."user_details" ADD CONSTRAINT "FK_6c546ad433ac7b1d0150d56a4a0" FOREIGN KEY ("ngoId") REFERENCES "tds"."ngo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."terminal" ADD CONSTRAINT "FK_e79f0b7ea9ecbf4b8f40d24253c" FOREIGN KEY ("phoneId") REFERENCES "tds"."phone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."terminal" ADD CONSTRAINT "FK_7ba07c350062802f4948b469f86" FOREIGN KEY ("tradingPointId") REFERENCES "tds"."trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."phone" ADD CONSTRAINT "FK_b9b6196ed8fe593d7904e7bf670" FOREIGN KEY ("prefixId") REFERENCES "tds"."phone_prefix"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" ADD CONSTRAINT "FK_91bcda4eaca210f4e8a2e57d9b7" FOREIGN KEY ("phoneId") REFERENCES "tds"."phone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" ADD CONSTRAINT "FK_91a7cd89e4c301fb7bec619b3be" FOREIGN KEY ("cardId") REFERENCES "tds"."physical_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" ADD CONSTRAINT "FK_fa1819796fb3a4e34cd98e42689" FOREIGN KEY ("cityId") REFERENCES "tds"."city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" ADD CONSTRAINT "FK_6cc2194f4792921e70f36226481" FOREIGN KEY ("typeId") REFERENCES "tds"."ngo_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."payment" ADD CONSTRAINT "FK_cdadd751e1f0d65184cbc1a25c0" FOREIGN KEY ("cartId") REFERENCES "tds"."cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."payment" ADD CONSTRAINT "FK_b42faca0452b1ae817b885d95e7" FOREIGN KEY ("tradingPointId") REFERENCES "tds"."trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."cart" ADD CONSTRAINT "FK_ea9cc791ca2a81a1c5ad609c791" FOREIGN KEY ("tradingPointId") REFERENCES "tds"."trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" ADD CONSTRAINT "FK_d5e5b865ed5296d09901b891c69" FOREIGN KEY ("typeId") REFERENCES "tds"."trading_point_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" ADD CONSTRAINT "FK_4be822e01c714d6894d90deb9db" FOREIGN KEY ("phoneId") REFERENCES "tds"."phone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" ADD CONSTRAINT "FK_62f94a4a236e41249d38ec0fede" FOREIGN KEY ("cityId") REFERENCES "tds"."city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD CONSTRAINT "FK_6536106c229f9e23c861ba3172e" FOREIGN KEY ("cartId") REFERENCES "tds"."cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD CONSTRAINT "FK_148fbc69dfa97f23673afaee1cb" FOREIGN KEY ("tradingPointId") REFERENCES "tds"."trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD CONSTRAINT "FK_6361d5c5109a6ec878d7061a49f" FOREIGN KEY ("userId") REFERENCES "tds"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" ADD CONSTRAINT "FK_e654db8c17a162786878b778e45" FOREIGN KEY ("terminalId") REFERENCES "tds"."terminal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."opinion" ADD CONSTRAINT "FK_c2bc20b7e827fc68371d0796aed" FOREIGN KEY ("userId") REFERENCES "tds"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."notification" ADD CONSTRAINT "FK_27af2ee7a4191d01d59230237a2" FOREIGN KEY ("userId") REFERENCES "tds"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD CONSTRAINT "FK_739a0975741e0bde34c0769ec3b" FOREIGN KEY ("terminalId") REFERENCES "tds"."terminal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD CONSTRAINT "FK_7e02d86b39f8d14a6d3a6edcb6d" FOREIGN KEY ("detailsId") REFERENCES "tds"."user_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD CONSTRAINT "FK_42ddc5d1ddbe9087e5af0841483" FOREIGN KEY ("cardId") REFERENCES "tds"."virtual_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."user" ADD CONSTRAINT "FK_9d4eab4c58d829d575301f57f7c" FOREIGN KEY ("phoneId") REFERENCES "tds"."phone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."account" ADD CONSTRAINT "FK_b284b05807b2d5690d7ee34015d" FOREIGN KEY ("roleId") REFERENCES "tds"."role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tds"."account" ADD CONSTRAINT "FK_1c5b12a3820b136fb60ddbefe5c" FOREIGN KEY ("userId") REFERENCES "tds"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."account" DROP CONSTRAINT "FK_1c5b12a3820b136fb60ddbefe5c"`);
        await queryRunner.query(`ALTER TABLE "tds"."account" DROP CONSTRAINT "FK_b284b05807b2d5690d7ee34015d"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP CONSTRAINT "FK_9d4eab4c58d829d575301f57f7c"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP CONSTRAINT "FK_42ddc5d1ddbe9087e5af0841483"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP CONSTRAINT "FK_7e02d86b39f8d14a6d3a6edcb6d"`);
        await queryRunner.query(`ALTER TABLE "tds"."user" DROP CONSTRAINT "FK_739a0975741e0bde34c0769ec3b"`);
        await queryRunner.query(`ALTER TABLE "tds"."notification" DROP CONSTRAINT "FK_27af2ee7a4191d01d59230237a2"`);
        await queryRunner.query(`ALTER TABLE "tds"."opinion" DROP CONSTRAINT "FK_c2bc20b7e827fc68371d0796aed"`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP CONSTRAINT "FK_e654db8c17a162786878b778e45"`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP CONSTRAINT "FK_6361d5c5109a6ec878d7061a49f"`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP CONSTRAINT "FK_148fbc69dfa97f23673afaee1cb"`);
        await queryRunner.query(`ALTER TABLE "tds"."transaction" DROP CONSTRAINT "FK_6536106c229f9e23c861ba3172e"`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" DROP CONSTRAINT "FK_62f94a4a236e41249d38ec0fede"`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" DROP CONSTRAINT "FK_4be822e01c714d6894d90deb9db"`);
        await queryRunner.query(`ALTER TABLE "tds"."trading_point" DROP CONSTRAINT "FK_d5e5b865ed5296d09901b891c69"`);
        await queryRunner.query(`ALTER TABLE "tds"."cart" DROP CONSTRAINT "FK_ea9cc791ca2a81a1c5ad609c791"`);
        await queryRunner.query(`ALTER TABLE "tds"."payment" DROP CONSTRAINT "FK_b42faca0452b1ae817b885d95e7"`);
        await queryRunner.query(`ALTER TABLE "tds"."payment" DROP CONSTRAINT "FK_cdadd751e1f0d65184cbc1a25c0"`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" DROP CONSTRAINT "FK_6cc2194f4792921e70f36226481"`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" DROP CONSTRAINT "FK_fa1819796fb3a4e34cd98e42689"`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" DROP CONSTRAINT "FK_91a7cd89e4c301fb7bec619b3be"`);
        await queryRunner.query(`ALTER TABLE "tds"."ngo" DROP CONSTRAINT "FK_91bcda4eaca210f4e8a2e57d9b7"`);
        await queryRunner.query(`ALTER TABLE "tds"."phone" DROP CONSTRAINT "FK_b9b6196ed8fe593d7904e7bf670"`);
        await queryRunner.query(`ALTER TABLE "tds"."terminal" DROP CONSTRAINT "FK_7ba07c350062802f4948b469f86"`);
        await queryRunner.query(`ALTER TABLE "tds"."terminal" DROP CONSTRAINT "FK_e79f0b7ea9ecbf4b8f40d24253c"`);
        await queryRunner.query(`ALTER TABLE "tds"."user_details" DROP CONSTRAINT "FK_6c546ad433ac7b1d0150d56a4a0"`);
        await queryRunner.query(`ALTER TABLE "tds"."donation" DROP CONSTRAINT "FK_4371365fb9333b231d98695a88c"`);
        await queryRunner.query(`ALTER TABLE "tds"."donation" DROP CONSTRAINT "FK_f7a32e3c9838b53aed8d8d6ca6c"`);
        await queryRunner.query(`DROP TABLE "tds"."configuration"`);
        await queryRunner.query(`DROP TABLE "tds"."account"`);
        await queryRunner.query(`DROP TABLE "tds"."user"`);
        await queryRunner.query(`DROP TABLE "tds"."notification"`);
        await queryRunner.query(`DROP TABLE "tds"."opinion"`);
        await queryRunner.query(`DROP TABLE "tds"."virtual_card"`);
        await queryRunner.query(`DROP TABLE "tds"."transaction"`);
        await queryRunner.query(`DROP TABLE "tds"."trading_point"`);
        await queryRunner.query(`DROP TABLE "tds"."cart"`);
        await queryRunner.query(`DROP TABLE "tds"."payment"`);
        await queryRunner.query(`DROP TABLE "tds"."city"`);
        await queryRunner.query(`DROP TABLE "tds"."ngo"`);
        await queryRunner.query(`DROP TABLE "tds"."phone"`);
        await queryRunner.query(`DROP TABLE "tds"."terminal"`);
        await queryRunner.query(`DROP TABLE "tds"."phone_prefix"`);
        await queryRunner.query(`DROP TABLE "tds"."physical_card"`);
        await queryRunner.query(`DROP TABLE "tds"."user_details"`);
        await queryRunner.query(`DROP TABLE "tds"."donation"`);
        await queryRunner.query(`DROP TABLE "tds"."ngo_type"`);
        await queryRunner.query(`DROP TABLE "tds"."trading_point_type"`);
        await queryRunner.query(`DROP TABLE "tds"."role"`);
    }

}
