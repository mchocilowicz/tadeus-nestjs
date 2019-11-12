module.exports = {
    url: "postgres://odssiaxcokktlf:508b8f90d75523785d99fd579694491c4bfc694bbed9fcb5bb3adde361db6f70@ec2-54-228-243-29.eu-west-1.compute.amazonaws.com:5432/d94jjeruacf7r4",
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
