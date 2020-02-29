import { MigrationInterface, QueryRunner } from "typeorm";

export class tablesSchema1550583533653 implements MigrationInterface {
    name = 'tablesSchema1550583533653';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "tds"."ROLE"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "VALUE"      character varying NOT NULL,
                                     CONSTRAINT "UQ_06055170e32770bf236a1f6b69e" UNIQUE ("VALUE"),
                                     CONSTRAINT "PK_dcffd4ffa07a27a051a1ddae645" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."ACCOUNT"
                                 (
                                     "SKID"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"     TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"     TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"             character varying NOT NULL,
                                     "CODE"           integer,
                                     "TOKEN"          character varying,
                                     "FIREBASE_TOKEN" character varying,
                                     "STATUS"         text              NOT NULL DEFAULT 'ACTIVE',
                                     "ROLE_SKID"      uuid              NOT NULL,
                                     CONSTRAINT "PK_a77d98693a1a69b5dbdf557a0d3" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."CITY"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "NAME"       character varying NOT NULL,
                                     CONSTRAINT "PK_58ebf3ed7adc7b8fd07b13b8046" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."NGO_TYPE"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "NAME"       character varying NOT NULL,
                                     "CODE"       SERIAL            NOT NULL,
                                     CONSTRAINT "PK_ac237eb29b7063df1240c34d517" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PARTNER_TYPE"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "NAME"       character varying NOT NULL,
                                     "CODE"       SERIAL            NOT NULL,
                                     CONSTRAINT "PK_303df8b52e2897444d64ecf95b1" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."NGO_PAYOUT"
                                 (
                                     "SKID"            uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"      TIMESTAMP NOT NULL DEFAULT now(),
                                     "UPDATED_AT"      TIMESTAMP NOT NULL DEFAULT now(),
                                     "PRICE"           numeric   NOT NULL,
                                     "IS_PAID"         boolean   NOT NULL DEFAULT false,
                                     "CAN_DISPLAY"     boolean   NOT NULL DEFAULT false,
                                     "NGO_SKID"        uuid,
                                     "NGO_PERIOD_SKID" uuid,
                                     CONSTRAINT "PK_a465e6058c1c25530b668c7fbc5" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."USER_PERIOD"
                                 (
                                     "SKID"                uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"          TIMESTAMP NOT NULL DEFAULT now(),
                                     "UPDATED_AT"          TIMESTAMP NOT NULL DEFAULT now(),
                                     "FROM"                TIMESTAMP NOT NULL,
                                     "TO"                  TIMESTAMP NOT NULL,
                                     "IS_CLOSED"           boolean   NOT NULL DEFAULT false,
                                     "NGO_PERIOD_SKID"     uuid,
                                     "PARTNER_PERIOD_SKID" uuid,
                                     CONSTRAINT "PK_6e3ad63be97830377506654fb6f" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."NGO_PERIOD"
                                 (
                                     "SKID"       uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP NOT NULL DEFAULT now(),
                                     "FROM"       TIMESTAMP NOT NULL,
                                     "TO"         TIMESTAMP NOT NULL,
                                     "IS_CLOSED"  boolean   NOT NULL DEFAULT false,
                                     CONSTRAINT "PK_4ccaeca35f8ee681ca5e54c2d1f" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PARTNER_PERIOD" ("SKID" uuid NOT NULL DEFAULT uuid_generate_v4(), "CREATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "UPDATED_AT" TIMESTAMP NOT NULL DEFAULT now(), "FROM" TIMESTAMP NOT NULL, "TO" TIMESTAMP NOT NULL, "IS_CLOSED" boolean NOT NULL DEFAULT false, "IS_EDITABLE" boolean NOT NULL DEFAULT true, "SEND_MESSAGES_AT" TIMESTAMP NOT NULL, "NOT_EDITABLE_AT" TIMESTAMP NOT NULL, "CLOSED_AT" TIMESTAMP NOT NULL, "NGO_PERIOD_SKID" uuid, CONSTRAINT "PK_c8028c325177def1d5eb3d66657" PRIMARY KEY ("SKID"))`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PARTNER_PAYMENT"
                                 (
                                     "SKID"                uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"          TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"          TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"                  character varying NOT NULL,
                                     "VALID_FROM"          TIMESTAMP,
                                     "VALID_TO"            TIMESTAMP,
                                     "PAYMENT_DETAILS"     character varying,
                                     "IS_PAID"             boolean           NOT NULL DEFAULT false,
                                     "PRICE"               numeric           NOT NULL,
                                     "PAID_PRICE"          numeric,
                                     "TRANSACTION_COUNT"   numeric           NOT NULL,
                                     "SELL_PRICE"          numeric           NOT NULL,
                                     "DONATION_PRICE"      numeric           NOT NULL,
                                     "PROVISION_PRICE"     numeric           NOT NULL,
                                     "SEND_MESSAGE_AT"     TIMESTAMP,
                                     "PAYMENT_AT"          TIMESTAMP,
                                     "PAYED_AT"            TIMESTAMP,
                                     "PARTNER_SKID"        uuid,
                                     "PARTNER_PERIOD_SKID" uuid,
                                     CONSTRAINT "PK_527b23801a8cd64ee5eaef9fe6f" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PHONE_PREFIX"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "VALUE"      integer           NOT NULL,
                                     "CODE"       character varying NOT NULL,
                                     "MAX_LENGTH" integer           NOT NULL,
                                     CONSTRAINT "UQ_cefdda512278876f2ceb6d20cdf" UNIQUE ("VALUE"),
                                     CONSTRAINT "PK_05a9317028f2a4e396f6ffe6a0e" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."ADMIN"
                                 (
                                     "SKID"         uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"   TIMESTAMP NOT NULL DEFAULT now(),
                                     "UPDATED_AT"   TIMESTAMP NOT NULL DEFAULT now(),
                                     "PHONE_SKID"   uuid,
                                     "ACCOUNT_SKID" uuid,
                                     CONSTRAINT "REL_8b8d9db84fa055be7cb57bc7b0" UNIQUE ("ACCOUNT_SKID"),
                                     CONSTRAINT "PK_777bda02eab8105286510f87c53" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PHONE"
                                 (
                                     "SKID"              uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"        TIMESTAMP NOT NULL DEFAULT now(),
                                     "UPDATED_AT"        TIMESTAMP NOT NULL DEFAULT now(),
                                     "VALUE"             integer   NOT NULL,
                                     "PHONE_PREFIX_SKID" uuid,
                                     CONSTRAINT "UQ_9319f6ea7ffa1aa5188e2cbb400" UNIQUE ("VALUE"),
                                     CONSTRAINT "UQ_9319f6ea7ffa1aa5188e2cbb400" UNIQUE ("VALUE"),
                                     CONSTRAINT "PK_711453a533bcd4384ec416b17b1" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."TERMINAL"
                                 (
                                     "SKID"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"   TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"   TIMESTAMP         NOT NULL DEFAULT now(),
                                     "STATUS"       text,
                                     "ID"           character varying NOT NULL,
                                     "IS_MAIN"      boolean           NOT NULL DEFAULT false,
                                     "NAME"         character varying,
                                     "PHONE_SKID"   uuid,
                                     "PARTNER_SKID" uuid,
                                     "ACCOUNT_SKID" uuid,
                                     CONSTRAINT "REL_95846394358851b133039b98e2" UNIQUE ("ACCOUNT_SKID"),
                                     CONSTRAINT "PK_746461660b0d4ca4c2230ac6109" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."OPINION"
                                 (
                                     "SKID"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"   TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"   TIMESTAMP         NOT NULL DEFAULT now(),
                                     "VALUE"        character varying NOT NULL,
                                     "EMAIL"        character varying,
                                     "USER_SKID"    uuid,
                                     "PARTNER_SKID" uuid,
                                     CONSTRAINT "PK_f453b35cd24e2bf5f1a34c1d390" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PARTNER"
                                 (
                                     "SKID"                uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"          TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"          TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"                  character varying NOT NULL,
                                     "NAME"                character varying NOT NULL,
                                     "DONATION_PERCENTAGE" numeric           NOT NULL,
                                     "VAT"                 numeric           NOT NULL,
                                     "FEE"                 numeric           NOT NULL,
                                     "DEFAULT_PRICE"       numeric           NOT NULL DEFAULT 0,
                                     "EMAIL"               character varying NOT NULL,
                                     "IMAGE"               character varying,
                                     "XP"                  integer           NOT NULL,
                                     "ACTIVE"              boolean           NOT NULL DEFAULT false,
                                     "CLOSED_AT"           TIMESTAMP,
                                     "PARTNER_TYPE_SKID"   uuid,
                                     "PHONE_SKID"          uuid,
                                     "ADDRESS_SKID"        uuid,
                                     CONSTRAINT "PK_5bbe7c1497be28addd4a8f74121" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."TRANSACTION"
                                 (
                                     "SKID"                 uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"           TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"           TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"                   character varying NOT NULL,
                                     "PRICE"                numeric           NOT NULL DEFAULT 0,
                                     "DONATION_PERCENTAGE"  numeric           NOT NULL DEFAULT 0,
                                     "PROVISION_PERCENTAGE" numeric           NOT NULL DEFAULT 0,
                                     "PAYMENT_VALUE"        numeric           NOT NULL DEFAULT 0,
                                     "VAT"                  numeric           NOT NULL DEFAULT 0,
                                     "PROVISION"            numeric           NOT NULL DEFAULT 0,
                                     "TOTAL_POOL"           numeric           NOT NULL DEFAULT 0,
                                     "DONATION_POOL"        numeric           NOT NULL DEFAULT 0,
                                     "PERSONAL_POOL"        numeric           NOT NULL DEFAULT 0,
                                     "USER_XP"              integer           NOT NULL,
                                     "PARTNER_XP"           integer           NOT NULL,
                                     "NGO_DONATION"         integer           NOT NULL,
                                     "STATUS"               text              NOT NULL DEFAULT 'WAITING',
                                     "IS_CORRECTION"        boolean           NOT NULL,
                                     "IS_PAID"              boolean           NOT NULL,
                                     "PARTNER_SKID"         uuid,
                                     "USER_SKID"            uuid,
                                     "TERMINAL_SKID"        uuid,
                                     "PARTNER_PAYMENT_SKID" uuid,
                                     "NGO_PAYOUTT_SKID"     uuid,
                                     "PARTNER_PERIOD_SKID"  uuid,
                                     "NGO_PERIOD_SKID"      uuid,
                                     "USER_PERIOD_SKID"     uuid,
                                     "NGO_SKID"             uuid,
                                     "CORRECTION_SKID"      uuid,
                                     CONSTRAINT "REL_0328ac4c30c75f2aec32521d1e" UNIQUE ("CORRECTION_SKID"),
                                     CONSTRAINT "PK_1fef9e3a42a9bdccffdc515b118" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."VIRTUAL_CARD"
                                 (
                                     "SKID"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"    TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"    TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"            character varying NOT NULL,
                                     "CODE"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "DONATION_POOL" numeric           NOT NULL DEFAULT 0,
                                     "PERSONAL_POOL" numeric           NOT NULL DEFAULT 0,
                                     "STATUS"        character varying NOT NULL,
                                     CONSTRAINT "PK_85d9acc409edcb9b3b9321da096" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."USER_PAYOUT"
                                 (
                                     "SKID"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"     TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"     TIMESTAMP         NOT NULL DEFAULT now(),
                                     "FIRST_NAME"     character varying NOT NULL,
                                     "LAST_NAME"      character varying NOT NULL,
                                     "ACCOUNT_NUMBER" character varying NOT NULL,
                                     "PRICE"          numeric           NOT NULL DEFAULT 0,
                                     "USER_SKID"      uuid,
                                     CONSTRAINT "PK_3b57fc63e3dc64873b2c9ed42b6" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."USER"
                                 (
                                     "SKID"              uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"        TIMESTAMP NOT NULL DEFAULT now(),
                                     "UPDATED_AT"        TIMESTAMP NOT NULL DEFAULT now(),
                                     "REGISTERED"        boolean   NOT NULL DEFAULT false,
                                     "IS_ANONYMOUS"      boolean   NOT NULL DEFAULT false,
                                     "XP"                integer   NOT NULL DEFAULT 0,
                                     "NAME"              character varying,
                                     "EMAIL"             character varying,
                                     "LAST_NAME"         character varying,
                                     "ACCOUNT_NUMBER"    integer,
                                     "COLLECTED_MONEY"   numeric   NOT NULL DEFAULT 0,
                                     "PREVIOUS_NAME"     character varying,
                                     "NGO_SELECTED_AT"   TIMESTAMP,
                                     "NGO_SKID"          uuid,
                                     "VIRTUAL_CARD_SKID" uuid,
                                     "PHONE_SKID"        uuid,
                                     "ACCOUNT_SKID"      uuid,
                                     CONSTRAINT "REL_4de6ab56b216243559eb5bfc31" UNIQUE ("VIRTUAL_CARD_SKID"),
                                     CONSTRAINT "REL_b02c3a28b7a10df66ffe065977" UNIQUE ("ACCOUNT_SKID"),
                                     CONSTRAINT "PK_292881401481420bc84414ec2c2" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."DONATION"
                                 (
                                     "SKID"             uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"       TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"       TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"               character varying NOT NULL,
                                     "TYPE"             text              NOT NULL,
                                     "POOL"             text              NOT NULL,
                                     "PAYMENT_NUMBER"   character varying,
                                     "PRICE"            numeric           NOT NULL,
                                     "NGO_SKID"         uuid,
                                     "USER_SKID"        uuid,
                                     "USER_PERIOD_SKID" uuid,
                                     "NGO_PERIOD_SKID"  uuid,
                                     CONSTRAINT "PK_a9508c16ef73e1a682e228a43d8" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PHYSICAL_CARD"
                                 (
                                     "SKID"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"      TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"      TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"              character varying NOT NULL,
                                     "CODE"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "COLLECTED_MONEY" numeric           NOT NULL DEFAULT 0,
                                     CONSTRAINT "PK_0cd9df469343b519166f98fd767" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."NGO"
                                 (
                                     "SKID"               uuid                   NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"         TIMESTAMP              NOT NULL DEFAULT now(),
                                     "UPDATED_AT"         TIMESTAMP              NOT NULL DEFAULT now(),
                                     "ID"                 character varying      NOT NULL,
                                     "BANK_ACCOUNT"       bigint                 NOT NULL,
                                     "EMAIL"              character varying      NOT NULL,
                                     "VERIFIED"           boolean                NOT NULL,
                                     "VERIFIED_AT"        TIMESTAMP,
                                     "NAME"               character varying      NOT NULL,
                                     "LONG_NAME"          character varying      NOT NULL,
                                     "DESCRIPTION"        character varying(550) NOT NULL,
                                     "IMAGE"              character varying,
                                     "THUMBNAIL"          character varying,
                                     "IS_TADEUS"          boolean                NOT NULL,
                                     "TOTAL_DONATION"     integer,
                                     "LAST_DONATION"      integer,
                                     "PHONE_SKID"         uuid,
                                     "PHYSICAL_CARD_SKID" uuid,
                                     "ADDRESS_SKID"       uuid,
                                     "NGO_TYPE_SKID"      uuid,
                                     CONSTRAINT "REL_d35dbf2364bbd4ab44f8df814d" UNIQUE ("PHYSICAL_CARD_SKID"),
                                     CONSTRAINT "PK_afd627a044f84c7f302f1a9ae96" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."ADDRESS"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "STREET"     character varying NOT NULL,
                                     "NUMBER"     integer           NOT NULL,
                                     "POST_CODE"  character varying NOT NULL,
                                     "LONGITUDE"  numeric           NOT NULL,
                                     "LATITUDE"   numeric           NOT NULL,
                                     "DISTANCE"   numeric           NOT NULL,
                                     "COORDINATE" geometry(Point, 4326),
                                     "CITY_SKID"  uuid,
                                     CONSTRAINT "PK_748029589e6bf083baf491fa721" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."SETTINGS"
                                 (
                                     "SKID"                   uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"             TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"             TIMESTAMP         NOT NULL DEFAULT now(),
                                     "MIN_NGO_TRANSFER"       numeric           NOT NULL,
                                     "MIN_PERSONAL_POOL"      numeric           NOT NULL,
                                     "USER_EXPIRATION"        integer           NOT NULL,
                                     "USER_CLOSE_INTERVAL"    integer           NOT NULL,
                                     "PARTNER_EMAIL_INTERVAL" integer           NOT NULL,
                                     "PARTNER_CLOSE_INTERVAL" integer           NOT NULL,
                                     "NGO_GENERATE_INTERVAL"  integer           NOT NULL,
                                     "NGO_CLOSE_INTERVAL"     integer           NOT NULL,
                                     "TYPE"                   character varying NOT NULL,
                                     CONSTRAINT "PK_b2c8adc0aae52ae85c6bdc36f52" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ACCOUNT"
            ADD CONSTRAINT "FK_16860ee42d1ca327042af01a74d" FOREIGN KEY ("ROLE_SKID") REFERENCES "tds"."ROLE" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO_PAYOUT"
            ADD CONSTRAINT "FK_266454fe4a805ffd7926f54cca8" FOREIGN KEY ("NGO_SKID") REFERENCES "tds"."NGO" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO_PAYOUT"
            ADD CONSTRAINT "FK_56b1219b248b34ce8eab9e9bef0" FOREIGN KEY ("NGO_PERIOD_SKID") REFERENCES "tds"."NGO_PERIOD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER_PERIOD"
            ADD CONSTRAINT "FK_4fce98d57ae3c3544b7a0b8b461" FOREIGN KEY ("NGO_PERIOD_SKID") REFERENCES "tds"."NGO_PERIOD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER_PERIOD"
            ADD CONSTRAINT "FK_3f995371950332ca551ddda9864" FOREIGN KEY ("PARTNER_PERIOD_SKID") REFERENCES "tds"."PARTNER_PERIOD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD"
            ADD CONSTRAINT "FK_08fc6c48de6037a3688fd0a03ca" FOREIGN KEY ("NGO_PERIOD_SKID") REFERENCES "tds"."NGO_PERIOD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT" ADD CONSTRAINT "FK_710e544f230110cf45350da2776" FOREIGN KEY ("PARTNER_SKID") REFERENCES "tds"."PARTNER"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT" ADD CONSTRAINT "FK_4a1435401f9f864dacd8d7e12b6" FOREIGN KEY ("PARTNER_PERIOD_SKID") REFERENCES "tds"."PARTNER_PERIOD"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADMIN" ADD CONSTRAINT "FK_5f535840a8ac0a375a246e000ca" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADMIN" ADD CONSTRAINT "FK_8b8d9db84fa055be7cb57bc7b0d" FOREIGN KEY ("ACCOUNT_SKID") REFERENCES "tds"."ACCOUNT"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PHONE" ADD CONSTRAINT "FK_2169691d86d018df1e0b97222c1" FOREIGN KEY ("PHONE_PREFIX_SKID") REFERENCES "tds"."PHONE_PREFIX"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL" ADD CONSTRAINT "FK_b8938dedd27cb41543c2bb89923" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL" ADD CONSTRAINT "FK_e8ae1cf22764bb5e7399043807b" FOREIGN KEY ("PARTNER_SKID") REFERENCES "tds"."PARTNER"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL" ADD CONSTRAINT "FK_95846394358851b133039b98e28" FOREIGN KEY ("ACCOUNT_SKID") REFERENCES "tds"."ACCOUNT"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."OPINION" ADD CONSTRAINT "FK_001d145222e62d25c45080a135f" FOREIGN KEY ("USER_SKID") REFERENCES "tds"."USER"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."OPINION" ADD CONSTRAINT "FK_6560e9e58a42134545668b059ba" FOREIGN KEY ("PARTNER_SKID") REFERENCES "tds"."PARTNER"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER" ADD CONSTRAINT "FK_db568e92a6a51de082382a66941" FOREIGN KEY ("PARTNER_TYPE_SKID") REFERENCES "tds"."PARTNER_TYPE"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER" ADD CONSTRAINT "FK_6c18e23b5fe8c1d97f7dbe2438c" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER" ADD CONSTRAINT "FK_10e3ce9c6adb777033244e4df33" FOREIGN KEY ("ADDRESS_SKID") REFERENCES "tds"."ADDRESS"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_7d126ea8825995f8286bfd8d371" FOREIGN KEY ("PARTNER_SKID") REFERENCES "tds"."PARTNER"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_4d9689d82df98957c777aa1e2c1" FOREIGN KEY ("USER_SKID") REFERENCES "tds"."USER"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_327c229325ffb06164157351a8b" FOREIGN KEY ("TERMINAL_SKID") REFERENCES "tds"."TERMINAL"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_ea02b25e9eaf6875296635f4050" FOREIGN KEY ("PARTNER_PAYMENT_SKID") REFERENCES "tds"."PARTNER_PAYMENT"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_e6f493cb3c690c5fdb6ef43b712" FOREIGN KEY ("NGO_PAYOUTT_SKID") REFERENCES "tds"."NGO_PAYOUT"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_b1aaae24ce06ca7c7d8051249e7" FOREIGN KEY ("PARTNER_PERIOD_SKID") REFERENCES "tds"."PARTNER_PERIOD"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_2701c1be90d0ea692aab11cfae3" FOREIGN KEY ("NGO_PERIOD_SKID") REFERENCES "tds"."NGO_PERIOD"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_231e05680da7f88e9d84316e014" FOREIGN KEY ("USER_PERIOD_SKID") REFERENCES "tds"."USER_PERIOD"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_dbbb620481c3be1376c65ef406a" FOREIGN KEY ("NGO_SKID") REFERENCES "tds"."NGO"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" ADD CONSTRAINT "FK_0328ac4c30c75f2aec32521d1e3" FOREIGN KEY ("CORRECTION_SKID") REFERENCES "tds"."TRANSACTION"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER_PAYOUT"
            ADD CONSTRAINT "FK_972cb1da7e6065351d6158af24f" FOREIGN KEY ("USER_SKID") REFERENCES "tds"."USER" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            ADD CONSTRAINT "FK_7eb89138e72c4a5f0a484a42c63" FOREIGN KEY ("NGO_SKID") REFERENCES "tds"."NGO" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            ADD CONSTRAINT "FK_4de6ab56b216243559eb5bfc318" FOREIGN KEY ("VIRTUAL_CARD_SKID") REFERENCES "tds"."VIRTUAL_CARD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER" ADD CONSTRAINT "FK_99922566837f1e11c05f978747d" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER" ADD CONSTRAINT "FK_b02c3a28b7a10df66ffe0659779" FOREIGN KEY ("ACCOUNT_SKID") REFERENCES "tds"."ACCOUNT"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" ADD CONSTRAINT "FK_bf71e32f0b74d4b7a52dd0c0be0" FOREIGN KEY ("NGO_SKID") REFERENCES "tds"."NGO"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" ADD CONSTRAINT "FK_3a0f9a495ecadb64613a6607feb" FOREIGN KEY ("USER_SKID") REFERENCES "tds"."USER"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" ADD CONSTRAINT "FK_3e8d8f3cb15c5c4fb77221d2b3d" FOREIGN KEY ("USER_PERIOD_SKID") REFERENCES "tds"."USER_PERIOD"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" ADD CONSTRAINT "FK_666b9b5f1269b0a001673df8be4" FOREIGN KEY ("NGO_PERIOD_SKID") REFERENCES "tds"."NGO_PERIOD"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO" ADD CONSTRAINT "FK_c8e3ca964d9f6b7d723ec6f46fa" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO" ADD CONSTRAINT "FK_d35dbf2364bbd4ab44f8df814d4" FOREIGN KEY ("PHYSICAL_CARD_SKID") REFERENCES "tds"."PHYSICAL_CARD"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO" ADD CONSTRAINT "FK_474692fb5dd685faf9f269cd1e0" FOREIGN KEY ("ADDRESS_SKID") REFERENCES "tds"."ADDRESS"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO" ADD CONSTRAINT "FK_76447f14951c78ae22e058a3d32" FOREIGN KEY ("NGO_TYPE_SKID") REFERENCES "tds"."NGO_TYPE"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADDRESS" ADD CONSTRAINT "FK_1d5a3a303d2eec41d21e574d3b8" FOREIGN KEY ("CITY_SKID") REFERENCES "tds"."CITY"("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."ADDRESS" DROP CONSTRAINT "FK_1d5a3a303d2eec41d21e574d3b8"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO" DROP CONSTRAINT "FK_76447f14951c78ae22e058a3d32"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO" DROP CONSTRAINT "FK_474692fb5dd685faf9f269cd1e0"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO" DROP CONSTRAINT "FK_d35dbf2364bbd4ab44f8df814d4"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO" DROP CONSTRAINT "FK_c8e3ca964d9f6b7d723ec6f46fa"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" DROP CONSTRAINT "FK_666b9b5f1269b0a001673df8be4"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" DROP CONSTRAINT "FK_3e8d8f3cb15c5c4fb77221d2b3d"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" DROP CONSTRAINT "FK_3a0f9a495ecadb64613a6607feb"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION" DROP CONSTRAINT "FK_bf71e32f0b74d4b7a52dd0c0be0"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER" DROP CONSTRAINT "FK_b02c3a28b7a10df66ffe0659779"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER" DROP CONSTRAINT "FK_99922566837f1e11c05f978747d"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            DROP CONSTRAINT "FK_4de6ab56b216243559eb5bfc318"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            DROP CONSTRAINT "FK_7eb89138e72c4a5f0a484a42c63"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER_PAYOUT"
            DROP CONSTRAINT "FK_972cb1da7e6065351d6158af24f"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_0328ac4c30c75f2aec32521d1e3"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_dbbb620481c3be1376c65ef406a"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_231e05680da7f88e9d84316e014"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_2701c1be90d0ea692aab11cfae3"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_b1aaae24ce06ca7c7d8051249e7"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_e6f493cb3c690c5fdb6ef43b712"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_ea02b25e9eaf6875296635f4050"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_327c229325ffb06164157351a8b"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_4d9689d82df98957c777aa1e2c1"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION" DROP CONSTRAINT "FK_7d126ea8825995f8286bfd8d371"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER" DROP CONSTRAINT "FK_10e3ce9c6adb777033244e4df33"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER" DROP CONSTRAINT "FK_6c18e23b5fe8c1d97f7dbe2438c"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER" DROP CONSTRAINT "FK_db568e92a6a51de082382a66941"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."OPINION" DROP CONSTRAINT "FK_6560e9e58a42134545668b059ba"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."OPINION" DROP CONSTRAINT "FK_001d145222e62d25c45080a135f"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL" DROP CONSTRAINT "FK_95846394358851b133039b98e28"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL" DROP CONSTRAINT "FK_e8ae1cf22764bb5e7399043807b"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL" DROP CONSTRAINT "FK_b8938dedd27cb41543c2bb89923"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PHONE" DROP CONSTRAINT "FK_2169691d86d018df1e0b97222c1"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADMIN" DROP CONSTRAINT "FK_8b8d9db84fa055be7cb57bc7b0d"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADMIN" DROP CONSTRAINT "FK_5f535840a8ac0a375a246e000ca"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT" DROP CONSTRAINT "FK_4a1435401f9f864dacd8d7e12b6"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT" DROP CONSTRAINT "FK_710e544f230110cf45350da2776"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PERIOD" DROP CONSTRAINT "FK_08fc6c48de6037a3688fd0a03ca"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER_PERIOD" DROP CONSTRAINT "FK_3f995371950332ca551ddda9864"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER_PERIOD" DROP CONSTRAINT "FK_4fce98d57ae3c3544b7a0b8b461"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO_PAYOUT" DROP CONSTRAINT "FK_56b1219b248b34ce8eab9e9bef0"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO_PAYOUT" DROP CONSTRAINT "FK_266454fe4a805ffd7926f54cca8"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ACCOUNT" DROP CONSTRAINT "FK_16860ee42d1ca327042af01a74d"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."SETTINGS"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."ADDRESS"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."NGO"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."PHYSICAL_CARD"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."DONATION"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."USER"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."USER_PAYOUT"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."VIRTUAL_CARD"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."TRANSACTION"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."PARTNER"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."OPINION"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."TERMINAL"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."PHONE"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."ADMIN"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."PHONE_PREFIX"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."PARTNER_PAYMENT"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."PARTNER_PERIOD"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."NGO_PERIOD"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."USER_PERIOD"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."NGO_PAYOUT"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."PARTNER_TYPE"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."NGO_TYPE"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."CITY"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."ACCOUNT"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."ROLE"`, undefined);
    }

}
