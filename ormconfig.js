module.exports = {
    url: process.env.TDS_DATABASE_URL,
    schema: process.env.TDS_DATABASE_SCHEMA,
    type: "postgres",
    extra: {
        ssl: true
    },
    entities: [
        "src/entity/*.entity{.ts,.js}"
    ],
    migrations: [
        "migrations/*.ts"
    ],
    cli: {
        migrationsDir: "migrations"
    },
    synchronize: false,
    logging: false
};
