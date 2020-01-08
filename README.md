# TADEUS

Project build using NestJs framework (https://docs.nestjs.com/)   

##  Technology
- nestjs
- multer
- nodemailer
- twilio
- PayU
- Swagger
- Typeorm
- dotenv
- jest
- nest-router
- nest-schedule
- node-polyglot
- xlsx
- typescript
- passport
- lodash
- jwt
- class-validator
- i18next

## Installation

### Dependencies:
```
$ npm install
```

### Configuration
To properly run application it is required to specify environment variables in .env file in config directory. 

```
TDS_DATABASE_URL - URL to Postgresql Database
TDS_DATABASE_SCHEMA - Database schema to store all project tables
TDS_VI - 16 chars to hash algoritm
TDS_ALG - hashing algorithm
TDS_PWD - 32 chars Password for hashing
TDS_TOKEN - algorithm to hash 
TDS_SALT - 13 chars salt
TDS_CRYPTO - crypto.js hashing algorithm
TDS_JWT_EVEREST - 18 chars for jwt
TDS_EMAIL_HOST - email host
TDS_EMAIL_USER- email user
TDS_EMAIL_PASSWORD - email password
```

## Important notes
Mandatory directories:
- config - configuration stored in .env
-  public/excel - template excel file to download in dashboard
- public/image - stores icon.jpg and thumbnail.jpg to be provided by owner. it stores images during image changes. 
- public/import- files stored during importing files

## Project structure
- common - all mechanics related to overall functions used in project
- database / entity - typescript object referencing databse tables
- databse / migrations - SQL migrations file to setup all necessary tables and default data
- i18n - files related to error messages in specific languages
- models - preferable all Models/Request/Responses used in entire project
- module - place to put all routes representing api call. There are three main modules: Client for Tadeus4Client, Partner for Tadeus4Partner and Dashboard for Dashboard Project. Each containing smaller modules representing simple api routes. Common module is used to store similar functionality between main three modules.
- schedulers - Jobs run in background at specific time

### Database setup
- Add PostGIS plugin
- Create new schema
- Run all migration script using
```
$ npm run typeorm-migration-run
```
- Create new entry in Configuration Table with name type="MAIN" by hand or with Dashboard project.
- Create three data rows in Period Table with type "CLIENT", "PARTNER", "NGO" by hand or with Dashboard project.
- Keep in mind that Period type "PARTNER" must have relation with "CLIENT" and "NGO" must have relation with "PARTNER".


## Running the app
Running app locally
```
$ npm run start
```

## Deployment
- Generate production files
```
$ npm run build
```
- Run production files
```
$ npm run start:prod
```