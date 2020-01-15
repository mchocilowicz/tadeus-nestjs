export class Const {
    static APP_NAME: string = 'TADEUS';
    static CONTROL_NUMBER = 77;
    static DATE_FORMAT = 'YYYY-MM-DD';
    static DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';

    static SWAGGER_LANGUAGE_HEADER = {
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    };
    static SWAGGER_AUTHORIZATION_HEADER = {
        name: 'Authorization',
        required: true,
        description: 'Auth token example Authorization: Bearer TOKEN'
    };
}
