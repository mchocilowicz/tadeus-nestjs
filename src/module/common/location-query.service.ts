import { BaseEntity, SelectQueryBuilder } from "typeorm";
import { ILocationQuery } from "../../models/client/query/location-query.interface";

export class LocationQueryService {

    static addDistanceCalculationToQuery(query: ILocationQuery, sqlQuery: SelectQueryBuilder<BaseEntity>): SelectQueryBuilder<BaseEntity> {
        if (query.longitude && query.latitude) {
            const lo = Number(query.longitude);
            const la = Number(query.latitude);

            const distanceQuery = `ST_Distance(ST_Transform(address.coordinate, 3857), ST_Transform('SRID=4326;POINT(${ lo } ${ la })'::geometry,3857)) * cosd(42.3521)`;
            const orderByCriteria: any = {};

            orderByCriteria[distanceQuery] = {
                order: "ASC",
                nulls: "NULLS FIRST"
            };

            sqlQuery = sqlQuery
                .addSelect(distanceQuery, 'address_DISTANCE');
            return sqlQuery
                .andWhere(`${ distanceQuery } > 0`)
                .orderBy(orderByCriteria)
                .limit(10);
        }

        return sqlQuery;
    }
}