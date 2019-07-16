module.exports = {
    url: process.env.DATABASE_URL,
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
    }
};
