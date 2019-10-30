module.exports = {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:6543/tadeus",
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
