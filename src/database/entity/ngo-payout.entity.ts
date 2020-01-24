import { Entity } from "typeorm";
import { TadeusEntity } from "./base.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'NGO_PAYOUT'})
export class NgoPayout extends TadeusEntity {

}