module.exports = {
    url: process.env.TDS_DATABASE_URL,
    schema: process.env.TDS_DATABASE_SCHEMA,
    type: "postgres",
    extra: {
        ssl: true
    },
    entities: [
        "src/database/entity/*.entity{.ts,.js}"
    ],
    migrations: [
        "src/database/migrations/*.ts"
    ],
    cli: {
        migrationsDir: "src/database/migrations"
    },
    synchronize: false,
    logging: true
};
