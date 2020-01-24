import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export class TadeusEntity extends BaseEntity {

    @PrimaryGeneratedColumn("uuid", {name: 'SKID'})
        // @ts-ignore
    id: string;

    @CreateDateColumn({name: 'CREATED_AT'})
        // @ts-ignore
    createdAt: Date;

    @UpdateDateColumn({name: "UPDATED_AT"})
        // @ts-ignore
    updatedAt: Date;
}
