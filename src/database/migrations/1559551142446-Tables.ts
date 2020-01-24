import { MigrationInterface, QueryRunner } from "typeorm";

export class Tables1559551142446 implements MigrationInterface {
    name = 'Tables1559551142446';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "tds"."ROLE"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "VALUE"      character varying NOT NULL,
                                     CONSTRAINT "UQ_df61a47731627f1321dfffb5fdc" UNIQUE ("VALUE"),
                                     CONSTRAINT "PK_1b9df387d8091156c12ea36aca5" PRIMARY KEY ("SKID")
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
                                     CONSTRAINT "PK_d25d60fb9f2fac93bf3f9d7897e" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."CITY"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "NAME"       character varying NOT NULL,
                                     CONSTRAINT "PK_187b241bc27ec055a55e9da7423" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."NGO_TYPE"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "NAME"       character varying NOT NULL,
                                     "CODE"       SERIAL            NOT NULL,
                                     CONSTRAINT "PK_c09858b8a7d0892d1b4037edb7c" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PARTNER_TYPE"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "NAME"       character varying NOT NULL,
                                     "CODE"       SERIAL            NOT NULL,
                                     CONSTRAINT "PK_6e3d45f3fc8568dc79bdc02710f" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PERIOD"
                                 (
                                     "SKID"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"  TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"  TIMESTAMP         NOT NULL DEFAULT now(),
                                     "FROM"        TIMESTAMP         NOT NULL,
                                     "TO"          TIMESTAMP         NOT NULL,
                                     "INTERVAL"    integer           NOT NULL,
                                     "TYPE"        character varying NOT NULL,
                                     "PERIOD_SKID" uuid,
                                     CONSTRAINT "REL_f3d1abeda2ad1834f1360bef4d" UNIQUE ("PERIOD_SKID"),
                                     CONSTRAINT "PK_afcd93f33e7363a969e379ba21c" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PARTNER_PAYMENT"
                                 (
                                     "SKID"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"     TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"     TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"             character varying NOT NULL,
                                     "PAYMENT_NUMBER" character varying,
                                     "IS_PAID"        boolean           NOT NULL DEFAULT false,
                                     "PRICE"          numeric,
                                     "PAYED_AT"       TIMESTAMP,
                                     "PARTNER_SKID"   uuid,
                                     "PERIOD_SKID"    uuid,
                                     CONSTRAINT "PK_7173f7a760be3bb5f46aae56ac9" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PHONE_PREFIX"
                                 (
                                     "SKID"       uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT" TIMESTAMP         NOT NULL DEFAULT now(),
                                     "VALUE"      integer           NOT NULL,
                                     "CODE"       character varying NOT NULL,
                                     "MAX_LENGTH" integer           NOT NULL,
                                     CONSTRAINT "UQ_0fb7065068e571cbf9acd703701" UNIQUE ("VALUE"),
                                     CONSTRAINT "PK_6303514d5d00c824e04cbb4c3f6" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."ADMIN"
                                 (
                                     "SKID"         uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"   TIMESTAMP NOT NULL DEFAULT now(),
                                     "UPDATED_AT"   TIMESTAMP NOT NULL DEFAULT now(),
                                     "PHONE_SKID"   uuid,
                                     "ACCOUNT_SKID" uuid,
                                     CONSTRAINT "REL_cb22e0b94f6ddf3a6b39110beb" UNIQUE ("ACCOUNT_SKID"),
                                     CONSTRAINT "PK_675811e545ff7c321136071afb0" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PHONE"
                                 (
                                     "SKID"              uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"        TIMESTAMP NOT NULL DEFAULT now(),
                                     "UPDATED_AT"        TIMESTAMP NOT NULL DEFAULT now(),
                                     "VALUE"             integer   NOT NULL,
                                     "PHONE_PREFIX_SKID" uuid,
                                     CONSTRAINT "UQ_94fa05f7d251cf912bac6b147e2" UNIQUE ("VALUE"),
                                     CONSTRAINT "UQ_94fa05f7d251cf912bac6b147e2" UNIQUE ("VALUE"),
                                     CONSTRAINT "PK_d05924668ab05b637c268d83dfc" PRIMARY KEY ("SKID")
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
                                     CONSTRAINT "REL_7a588154a8f16dfafc82e2a762" UNIQUE ("ACCOUNT_SKID"),
                                     CONSTRAINT "PK_6c94f5a8de3b12847a044e1d90f" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."OPINION"
                                 (
                                     "SKID"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"   TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"   TIMESTAMP         NOT NULL DEFAULT now(),
                                     "VALUE"        character varying NOT NULL,
                                     "EMAIL"        character varying NOT NULL,
                                     "USER_SKID"    uuid,
                                     "PARTNER_SKID" uuid,
                                     CONSTRAINT "PK_9e9baf0e6470dfa30c8446c6943" PRIMARY KEY ("SKID")
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
                                     CONSTRAINT "PK_0b0aa876cb1693a737d922abcec" PRIMARY KEY ("SKID")
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
                                     "STATUS"               text              NOT NULL DEFAULT 'WAITING',
                                     "IS_CORRECTION"        boolean           NOT NULL,
                                     "PARTNER_SKID"         uuid,
                                     "USER_SKID"            uuid,
                                     "TERMINAL_SKID"        uuid,
                                     "PARTNER_PAYMENT_SKID" uuid,
                                     "DONATION_SKID"        uuid,
                                     "CORRECTION_SKID"      uuid,
                                     CONSTRAINT "REL_254494463bdfb21a3d6f1ec547" UNIQUE ("CORRECTION_SKID"),
                                     CONSTRAINT "PK_b72d7a3d898fb3dae8a2d83d195" PRIMARY KEY ("SKID")
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
                                     CONSTRAINT "PK_5b50196671807b4dc5208055733" PRIMARY KEY ("SKID")
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
                                     CONSTRAINT "PK_5fd9f29dede39dbdc9f6f72226c" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."USER"
                                 (
                                     "SKID"                uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"          TIMESTAMP NOT NULL DEFAULT now(),
                                     "UPDATED_AT"          TIMESTAMP NOT NULL DEFAULT now(),
                                     "REGISTERED"          boolean   NOT NULL DEFAULT false,
                                     "IS_ANONYMOUS"        boolean   NOT NULL DEFAULT false,
                                     "XP"                  integer   NOT NULL DEFAULT 0,
                                     "NAME"                character varying,
                                     "EMAIL"               character varying,
                                     "LAST_NAME"           character varying,
                                     "ACCOUNT_NUMBER"      integer,
                                     "COLLECTED_MONEY"     numeric   NOT NULL DEFAULT 0,
                                     "NGO_TEMP_MONEY"      numeric   NOT NULL DEFAULT 0,
                                     "NGO_SELECTION_COUNT" integer   NOT NULL DEFAULT 0,
                                     "PREVIOUS_NAME"       character varying,
                                     "ngoId"               uuid,
                                     "VIRTUAL_CARD_SKID"   uuid,
                                     "PHONE_SKID"          uuid,
                                     "ACCOUNT_SKID"        uuid,
                                     CONSTRAINT "REL_c37135dffec0c084e1236e8080" UNIQUE ("VIRTUAL_CARD_SKID"),
                                     CONSTRAINT "REL_a952fdf6ce8b429547cac7c4c2" UNIQUE ("ACCOUNT_SKID"),
                                     CONSTRAINT "PK_d6de40b30e4e6ec7062169e0334" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."DONATION"
                                 (
                                     "SKID"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"     TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"     TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"             character varying NOT NULL,
                                     "PAYMENT_NUMBER" character varying,
                                     "TYPE"           text              NOT NULL,
                                     "POOL"           text              NOT NULL,
                                     "PRICE"          numeric           NOT NULL,
                                     "IS_PAID"        boolean           NOT NULL DEFAULT false,
                                     "PAYED_AT"       TIMESTAMP,
                                     "NGO_SKID"       uuid,
                                     "USER_SKID"      uuid,
                                     "PERIOD_SKID"    uuid,
                                     CONSTRAINT "PK_1c1d536698f1620bd5e4a622f3a" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."PHYSICAL_CARD"
                                 (
                                     "SKID"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"      TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"      TIMESTAMP         NOT NULL DEFAULT now(),
                                     "ID"              character varying NOT NULL,
                                     "CODE"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "COLLECTED_MONEY" numeric           NOT NULL DEFAULT 0,
                                     CONSTRAINT "PK_5bc59bdb3025b6c5dbd3c90d081" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."NGO"
                                 (
                                     "SKID"          uuid                   NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"    TIMESTAMP              NOT NULL DEFAULT now(),
                                     "UPDATED_AT"    TIMESTAMP              NOT NULL DEFAULT now(),
                                     "ID"            character varying      NOT NULL,
                                     "bankNumber"    character varying      NOT NULL,
                                     "email"         character varying      NOT NULL,
                                     "verified"      boolean                NOT NULL,
                                     "verifiedAt"    TIMESTAMP,
                                     "name"          character varying      NOT NULL,
                                     "longName"      character varying      NOT NULL,
                                     "description"   character varying(550) NOT NULL,
                                     "image"         character varying,
                                     "thumbnail"     character varying,
                                     "isTadeus"      boolean                NOT NULL,
                                     "totalDonation" integer,
                                     "lastDonation"  integer,
                                     "PHONE_SKID"    uuid,
                                     "cardId"        uuid,
                                     "ADDRESS_SKID"  uuid,
                                     "NGO_TYPE_SKID" uuid,
                                     CONSTRAINT "REL_93df267fe530f11796eaceb751" UNIQUE ("cardId"),
                                     CONSTRAINT "PK_41e741477ebe28076ad55a0fc03" PRIMARY KEY ("SKID")
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
                                     CONSTRAINT "PK_1cb6df556213dc6d75a2355b48c" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`CREATE TABLE "tds"."SETTINGS"
                                 (
                                     "SKID"              uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                     "CREATED_AT"        TIMESTAMP         NOT NULL DEFAULT now(),
                                     "UPDATED_AT"        TIMESTAMP         NOT NULL DEFAULT now(),
                                     "MIN_NGO_TRANSFER"  numeric           NOT NULL,
                                     "MIN_PERSONAL_POOL" numeric           NOT NULL,
                                     "USER_EXPIRATION"   integer           NOT NULL,
                                     "TYPE"              character varying NOT NULL,
                                     CONSTRAINT "PK_f62e97458efc72d8db8ec2fe07d" PRIMARY KEY ("SKID")
                                 )`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ACCOUNT"
            ADD CONSTRAINT "FK_4416e66416c17439e8e1eb99808" FOREIGN KEY ("ROLE_SKID") REFERENCES "tds"."ROLE" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD"
            ADD CONSTRAINT "FK_f3d1abeda2ad1834f1360bef4de" FOREIGN KEY ("PERIOD_SKID") REFERENCES "tds"."PERIOD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT"
            ADD CONSTRAINT "FK_61edcd792e02aa901e9e2f8fa24" FOREIGN KEY ("PARTNER_SKID") REFERENCES "tds"."PARTNER" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT"
            ADD CONSTRAINT "FK_8050a663e2eb46a6c87d8957de9" FOREIGN KEY ("PERIOD_SKID") REFERENCES "tds"."PERIOD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADMIN"
            ADD CONSTRAINT "FK_ab33bbb2d7273c807b6d27075f6" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADMIN"
            ADD CONSTRAINT "FK_cb22e0b94f6ddf3a6b39110beb0" FOREIGN KEY ("ACCOUNT_SKID") REFERENCES "tds"."ACCOUNT" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PHONE"
            ADD CONSTRAINT "FK_d753826a556a28e25f7a1bb0a61" FOREIGN KEY ("PHONE_PREFIX_SKID") REFERENCES "tds"."PHONE_PREFIX" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL"
            ADD CONSTRAINT "FK_1cd67eca352de4f68df442c4fb1" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL"
            ADD CONSTRAINT "FK_6daedd976e2fc46b3cdbc948b58" FOREIGN KEY ("PARTNER_SKID") REFERENCES "tds"."PARTNER" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL"
            ADD CONSTRAINT "FK_7a588154a8f16dfafc82e2a7627" FOREIGN KEY ("ACCOUNT_SKID") REFERENCES "tds"."ACCOUNT" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."OPINION"
            ADD CONSTRAINT "FK_4a0c617ac29642d0e1d15a3a0cb" FOREIGN KEY ("USER_SKID") REFERENCES "tds"."USER" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."OPINION"
            ADD CONSTRAINT "FK_4ce281a40c25b6bb4b4975373f0" FOREIGN KEY ("PARTNER_SKID") REFERENCES "tds"."PARTNER" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER"
            ADD CONSTRAINT "FK_8e69cf8dc001185e2676f3829a3" FOREIGN KEY ("PARTNER_TYPE_SKID") REFERENCES "tds"."PARTNER_TYPE" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER"
            ADD CONSTRAINT "FK_8e0e8e62c1894322239df791244" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER"
            ADD CONSTRAINT "FK_fba0cc13bd7a50b46fb91040d55" FOREIGN KEY ("ADDRESS_SKID") REFERENCES "tds"."ADDRESS" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ADD CONSTRAINT "FK_1ad2a2f60cdc22aeac7385bd95f" FOREIGN KEY ("PARTNER_SKID") REFERENCES "tds"."PARTNER" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ADD CONSTRAINT "FK_c89800a6027addb01de8b359d0e" FOREIGN KEY ("USER_SKID") REFERENCES "tds"."USER" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ADD CONSTRAINT "FK_0cab1a589381b6d5126a42af374" FOREIGN KEY ("TERMINAL_SKID") REFERENCES "tds"."TERMINAL" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ADD CONSTRAINT "FK_faefdb3b003cfb6865ee96b9dde" FOREIGN KEY ("PARTNER_PAYMENT_SKID") REFERENCES "tds"."PARTNER_PAYMENT" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ADD CONSTRAINT "FK_be6be793f94a4179828b8c9cb77" FOREIGN KEY ("DONATION_SKID") REFERENCES "tds"."DONATION" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            ADD CONSTRAINT "FK_254494463bdfb21a3d6f1ec5478" FOREIGN KEY ("CORRECTION_SKID") REFERENCES "tds"."TRANSACTION" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER_PAYOUT"
            ADD CONSTRAINT "FK_69b2baf1d78ba895098e39a5ace" FOREIGN KEY ("USER_SKID") REFERENCES "tds"."USER" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            ADD CONSTRAINT "FK_cd81032105ba396463279f0b273" FOREIGN KEY ("ngoId") REFERENCES "tds"."NGO" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            ADD CONSTRAINT "FK_c37135dffec0c084e1236e8080d" FOREIGN KEY ("VIRTUAL_CARD_SKID") REFERENCES "tds"."VIRTUAL_CARD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            ADD CONSTRAINT "FK_611208abc200329b4f9bcd77f7f" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            ADD CONSTRAINT "FK_a952fdf6ce8b429547cac7c4c29" FOREIGN KEY ("ACCOUNT_SKID") REFERENCES "tds"."ACCOUNT" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            ADD CONSTRAINT "FK_fc05f66577c111cc67ce53d96ee" FOREIGN KEY ("NGO_SKID") REFERENCES "tds"."NGO" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            ADD CONSTRAINT "FK_dd870c2bb5449c22c9540ccf8ed" FOREIGN KEY ("USER_SKID") REFERENCES "tds"."USER" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            ADD CONSTRAINT "FK_702a9b7964ad93aa91b52a49576" FOREIGN KEY ("PERIOD_SKID") REFERENCES "tds"."PERIOD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO"
            ADD CONSTRAINT "FK_5775eb4d28ff304f05342856f37" FOREIGN KEY ("PHONE_SKID") REFERENCES "tds"."PHONE" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO"
            ADD CONSTRAINT "FK_93df267fe530f11796eaceb751f" FOREIGN KEY ("cardId") REFERENCES "tds"."PHYSICAL_CARD" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO"
            ADD CONSTRAINT "FK_d9d30c65630fd36ae1a8f4537c5" FOREIGN KEY ("ADDRESS_SKID") REFERENCES "tds"."ADDRESS" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO"
            ADD CONSTRAINT "FK_0093acbe5691874289defbe70b9" FOREIGN KEY ("NGO_TYPE_SKID") REFERENCES "tds"."NGO_TYPE" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADDRESS"
            ADD CONSTRAINT "FK_95f3a7ed3f8722e976072ab7195" FOREIGN KEY ("CITY_SKID") REFERENCES "tds"."CITY" ("SKID") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tds"."ADDRESS"
            DROP CONSTRAINT "FK_95f3a7ed3f8722e976072ab7195"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO"
            DROP CONSTRAINT "FK_0093acbe5691874289defbe70b9"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO"
            DROP CONSTRAINT "FK_d9d30c65630fd36ae1a8f4537c5"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO"
            DROP CONSTRAINT "FK_93df267fe530f11796eaceb751f"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."NGO"
            DROP CONSTRAINT "FK_5775eb4d28ff304f05342856f37"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            DROP CONSTRAINT "FK_702a9b7964ad93aa91b52a49576"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            DROP CONSTRAINT "FK_dd870c2bb5449c22c9540ccf8ed"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."DONATION"
            DROP CONSTRAINT "FK_fc05f66577c111cc67ce53d96ee"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            DROP CONSTRAINT "FK_a952fdf6ce8b429547cac7c4c29"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            DROP CONSTRAINT "FK_611208abc200329b4f9bcd77f7f"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            DROP CONSTRAINT "FK_c37135dffec0c084e1236e8080d"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER"
            DROP CONSTRAINT "FK_cd81032105ba396463279f0b273"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."USER_PAYOUT"
            DROP CONSTRAINT "FK_69b2baf1d78ba895098e39a5ace"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            DROP CONSTRAINT "FK_254494463bdfb21a3d6f1ec5478"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            DROP CONSTRAINT "FK_be6be793f94a4179828b8c9cb77"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            DROP CONSTRAINT "FK_faefdb3b003cfb6865ee96b9dde"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            DROP CONSTRAINT "FK_0cab1a589381b6d5126a42af374"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            DROP CONSTRAINT "FK_c89800a6027addb01de8b359d0e"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TRANSACTION"
            DROP CONSTRAINT "FK_1ad2a2f60cdc22aeac7385bd95f"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER"
            DROP CONSTRAINT "FK_fba0cc13bd7a50b46fb91040d55"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER"
            DROP CONSTRAINT "FK_8e0e8e62c1894322239df791244"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER"
            DROP CONSTRAINT "FK_8e69cf8dc001185e2676f3829a3"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."OPINION"
            DROP CONSTRAINT "FK_4ce281a40c25b6bb4b4975373f0"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."OPINION"
            DROP CONSTRAINT "FK_4a0c617ac29642d0e1d15a3a0cb"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL"
            DROP CONSTRAINT "FK_7a588154a8f16dfafc82e2a7627"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL"
            DROP CONSTRAINT "FK_6daedd976e2fc46b3cdbc948b58"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."TERMINAL"
            DROP CONSTRAINT "FK_1cd67eca352de4f68df442c4fb1"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PHONE"
            DROP CONSTRAINT "FK_d753826a556a28e25f7a1bb0a61"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADMIN"
            DROP CONSTRAINT "FK_cb22e0b94f6ddf3a6b39110beb0"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ADMIN"
            DROP CONSTRAINT "FK_ab33bbb2d7273c807b6d27075f6"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT"
            DROP CONSTRAINT "FK_8050a663e2eb46a6c87d8957de9"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PARTNER_PAYMENT"
            DROP CONSTRAINT "FK_61edcd792e02aa901e9e2f8fa24"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."PERIOD"
            DROP CONSTRAINT "FK_f3d1abeda2ad1834f1360bef4de"`, undefined);
        await queryRunner.query(`ALTER TABLE "tds"."ACCOUNT"
            DROP CONSTRAINT "FK_4416e66416c17439e8e1eb99808"`, undefined);
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
        await queryRunner.query(`DROP TABLE "tds"."PERIOD"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."PARTNER_TYPE"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."NGO_TYPE"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."CITY"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."ACCOUNT"`, undefined);
        await queryRunner.query(`DROP TABLE "tds"."ROLE"`, undefined);
    }

}
