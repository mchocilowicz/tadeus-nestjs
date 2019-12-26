module.exports = {
    url: "postgres://postgres:marcin12@localhost:5432/tadeus",
    type: "postgres",
    extra: {
        ssl: false
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
