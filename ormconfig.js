module.exports = {
    url: "",
    type: "postgres",
    extra: {
        ssl: true
    },
    schema: 'tds',
    entities: [
        "src/database/entity/*.entity{.ts,.js}"
    ],
    migrations: [
        "src/database/migrations/*.ts"
    ],
    cli: {
        migrationsDir: "src/database/migrations"
    }
};
