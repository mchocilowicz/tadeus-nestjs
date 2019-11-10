import {BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";


export class TadeusEntity extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
        // @ts-ignore
    id: string;

    @CreateDateColumn()
        // @ts-ignore
    createdAt: Date;

    @UpdateDateColumn()
        // @ts-ignore
    updatedAt: Date;
}
