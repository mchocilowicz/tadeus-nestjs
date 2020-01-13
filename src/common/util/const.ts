export class Const {
    static APP_NAME: string = 'TADEUS';
    static HEADER_ACCEPT_LANGUAGE = 'Accept-Language';
    static HEADER_ACCEPT_LANGUAGE_DESC = 'Language of returned Error message. [pl,eng]';
    static HEADER_AUTHORIZATION = 'Authorization';
    static HEADER_AUTHORIZATION_DESC = 'Auth token example Authorization: Bearer TOKEN';
    static CONTROL_NUMBER = 77;
    static DATE_FORMAT = 'YYYY-MM-DD';

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
