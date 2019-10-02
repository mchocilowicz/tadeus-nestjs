import { MigrationInterface, QueryRunner } from "typeorm";

export class TableGeneration1555045847186 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trading_point_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "code" integer NOT NULL, CONSTRAINT "UQ_ebbc1668061227fb523e00f6b3b" UNIQUE ("name"), CONSTRAINT "PK_98da834a3a9e28b66d57911d9fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ngo_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_8b94228d0b45c99f6be06e4819a" UNIQUE ("name"), CONSTRAINT "PK_7d5e2242c84cdfff9fd9c7d1b4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "donation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "invoiceNumber" character varying, "type" text NOT NULL, "pool" text NOT NULL, "price" numeric NOT NULL, "isPaid" boolean NOT NULL DEFAULT false, "payedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ngoId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_25fb5a541964bc5cfc18fb13a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "xp" integer NOT NULL DEFAULT 0, "fullName" character varying, "bankAccount" integer, "collectedMoney" numeric NOT NULL DEFAULT 0, "ngoTempMoney" numeric NOT NULL DEFAULT 0, "ngoSelectionCount" integer NOT NULL DEFAULT 0, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ngoId" uuid, CONSTRAINT "PK_fb08394d3f499b9e441cab9ca51" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "physical_card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "collectedMoney" numeric NOT NULL DEFAULT 0, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_64afb08d604a8c78a8cb52db9d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ngo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "bankNumber" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying NOT NULL, "verified" boolean NOT NULL, "verifiedAt" TIMESTAMP, "longitude" numeric NOT NULL, "latitude" numeric NOT NULL, "distance" integer, "coordinate" geometry(Point,4326), "name" character varying NOT NULL, "address" character varying NOT NULL, "postCode" character varying NOT NULL, "totalDonation" integer, "lastDonation" integer, "creationAt" TIMESTAMP NOT NULL DEFAULT now(), "cardId" uuid, "cityId" uuid NOT NULL, "typeId" uuid NOT NULL, CONSTRAINT "UQ_b16ce2feab21db61ee5db4ab498" UNIQUE ("name"), CONSTRAINT "REL_23f39fb24310d90424710f5e26" UNIQUE ("cardId"), CONSTRAINT "PK_da3e13acb48ce5a2e7146f71a25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "city" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_f8c0858628830a35f19efdc0ecf" UNIQUE ("name"), CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "invoiceNumber" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "cartId" uuid, "tradingPointId" uuid, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isPaid" boolean NOT NULL DEFAULT false, "price" numeric, "paymentDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tradingPointId" uuid, CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "terminal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "step" text, "phone" character varying NOT NULL, "ID" character varying NOT NULL, "tradingPointId" uuid, CONSTRAINT "PK_5404f9799fb761bd9b01070356a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trading_point" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "name" character varying NOT NULL, "donationPercentage" numeric NOT NULL, "vat" numeric NOT NULL, "fee" numeric NOT NULL, "longitude" numeric NOT NULL, "latitude" numeric NOT NULL, "distance" integer, "coordinate" geometry(Point,4326), "address" character varying NOT NULL, "postCode" character varying NOT NULL, "xp" integer NOT NULL, "active" boolean NOT NULL DEFAULT true, "closedDate" TIMESTAMP, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "typeId" uuid NOT NULL, "cityId" uuid NOT NULL, CONSTRAINT "UQ_f00a3a5409e5f33c8c8db9af986" UNIQUE ("name"), CONSTRAINT "PK_05479e863fff010cf70d58f7399" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "price" numeric NOT NULL, "donationPercentage" numeric NOT NULL, "donationValue" numeric NOT NULL, "userXp" integer NOT NULL, "tradingPointXp" integer NOT NULL, "isCorrection" boolean NOT NULL, "verifiedByUser" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "cartId" uuid, "tradingPointId" uuid, "userId" uuid, "terminalId" uuid, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "virtual_card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "code" uuid NOT NULL DEFAULT uuid_generate_v4(), "donationPool" numeric NOT NULL, "personalPool" numeric NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_42a5e76c9d2229e675beffd98ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying, "name" character varying, "email" character varying, "registered" boolean NOT NULL DEFAULT false, "isAnonymous" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "terminalId" uuid, "detailsId" uuid, "cardId" uuid, CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "REL_de44ed71836e81c3fca3dc7fc5" UNIQUE ("cardId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ID" character varying NOT NULL, "code" integer, "token" character varying, "status" text NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "roleId" uuid NOT NULL, "userId" uuid, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "configuration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "minNgoTransfer" numeric NOT NULL, "minPersonalPool" numeric NOT NULL, "currentClientPaymentDate" TIMESTAMP NOT NULL, "clientCycleDays" integer NOT NULL, "nextClientPaymentDate" TIMESTAMP NOT NULL, "currentPartnerPaymentDate" TIMESTAMP NOT NULL, "partnerCycleDays" integer NOT NULL, "nextPartnerPaymentDate" TIMESTAMP NOT NULL, "currentNgoPaymentDate" TIMESTAMP NOT NULL, "ngoCycleDays" integer NOT NULL, "nextNgoPaymentDate" TIMESTAMP NOT NULL, "type" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_03bad512915052d2342358f0d8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "phone_prefix" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" character varying NOT NULL, "code" character varying NOT NULL, "maxLength" integer NOT NULL, CONSTRAINT "UQ_c0442eb83e7bf910b7168fe2a30" UNIQUE ("value", "code"), CONSTRAINT "PK_7404f8caa4e9d1efcaf73bef457" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "donation" ADD CONSTRAINT "FK_507622b6c06ce0e57d33bc72a8c" FOREIGN KEY ("ngoId") REFERENCES "ngo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "donation" ADD CONSTRAINT "FK_063499388657e648418470a439a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_details" ADD CONSTRAINT "FK_877e44bf15f92d455d2a5a07f0a" FOREIGN KEY ("ngoId") REFERENCES "ngo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD CONSTRAINT "FK_23f39fb24310d90424710f5e266" FOREIGN KEY ("cardId") REFERENCES "physical_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD CONSTRAINT "FK_3a1395d6b918f25d0f7cc042841" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ngo" ADD CONSTRAINT "FK_f6ac76288c787c507dd343a8751" FOREIGN KEY ("typeId") REFERENCES "ngo_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_6f5b708b8fd618ea78a9f10ccfe" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_380800b1d14b5f401521f5e4fb5" FOREIGN KEY ("tradingPointId") REFERENCES "trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_38ddca5cd1d798f0d87665a4013" FOREIGN KEY ("tradingPointId") REFERENCES "trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "terminal" ADD CONSTRAINT "FK_ca913940b7d3ee620edf39401e6" FOREIGN KEY ("tradingPointId") REFERENCES "trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD CONSTRAINT "FK_f7e61f50f55ba758ccb7159412e" FOREIGN KEY ("typeId") REFERENCES "trading_point_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trading_point" ADD CONSTRAINT "FK_aaf63b5e53db9679c62a151181e" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_2e98daa522db627daf36b26ccc3" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_6f545a5b4c0adedb79f9baae2cf" FOREIGN KEY ("tradingPointId") REFERENCES "trading_point"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_71bf4f5ef5281da71e23ede3be3" FOREIGN KEY ("terminalId") REFERENCES "terminal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_0952b008e9d96ddca010d4e6503" FOREIGN KEY ("terminalId") REFERENCES "terminal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_4c62c8388460a107d0f450f9e0c" FOREIGN KEY ("detailsId") REFERENCES "user_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_de44ed71836e81c3fca3dc7fc5c" FOREIGN KEY ("cardId") REFERENCES "virtual_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_77bf26eef8865441fb9bd53a364" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_60328bf27019ff5498c4b977421" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_60328bf27019ff5498c4b977421"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_77bf26eef8865441fb9bd53a364"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_de44ed71836e81c3fca3dc7fc5c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_4c62c8388460a107d0f450f9e0c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_0952b008e9d96ddca010d4e6503"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_71bf4f5ef5281da71e23ede3be3"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_6f545a5b4c0adedb79f9baae2cf"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_2e98daa522db627daf36b26ccc3"`);
        await queryRunner.query(`ALTER TABLE "trading_point" DROP CONSTRAINT "FK_aaf63b5e53db9679c62a151181e"`);
        await queryRunner.query(`ALTER TABLE "trading_point" DROP CONSTRAINT "FK_f7e61f50f55ba758ccb7159412e"`);
        await queryRunner.query(`ALTER TABLE "terminal" DROP CONSTRAINT "FK_ca913940b7d3ee620edf39401e6"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_38ddca5cd1d798f0d87665a4013"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_380800b1d14b5f401521f5e4fb5"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_6f5b708b8fd618ea78a9f10ccfe"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP CONSTRAINT "FK_f6ac76288c787c507dd343a8751"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP CONSTRAINT "FK_3a1395d6b918f25d0f7cc042841"`);
        await queryRunner.query(`ALTER TABLE "ngo" DROP CONSTRAINT "FK_23f39fb24310d90424710f5e266"`);
        await queryRunner.query(`ALTER TABLE "user_details" DROP CONSTRAINT "FK_877e44bf15f92d455d2a5a07f0a"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP CONSTRAINT "FK_063499388657e648418470a439a"`);
        await queryRunner.query(`ALTER TABLE "donation" DROP CONSTRAINT "FK_507622b6c06ce0e57d33bc72a8c"`);
        await queryRunner.query(`DROP TABLE "phone_prefix"`);
        await queryRunner.query(`DROP TABLE "configuration"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "virtual_card"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TABLE "trading_point"`);
        await queryRunner.query(`DROP TABLE "terminal"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TABLE "city"`);
        await queryRunner.query(`DROP TABLE "ngo"`);
        await queryRunner.query(`DROP TABLE "physical_card"`);
        await queryRunner.query(`DROP TABLE "user_details"`);
        await queryRunner.query(`DROP TABLE "donation"`);
        await queryRunner.query(`DROP TABLE "ngo_type"`);
        await queryRunner.query(`DROP TABLE "trading_point_type"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
