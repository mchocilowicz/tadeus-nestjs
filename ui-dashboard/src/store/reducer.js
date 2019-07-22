import {
    CHANGE_LANGUAGE,
    ERROR,
    SUBMIT_USER_CODE,
    SUBMIT_USER_PHONE,
    UPDATE_USER_CODE,
    UPDATE_USER_PHONE
} from "./actions";

const initialState = {
    phone: '',
    code: '',
    phoneSubmit: false,
    error: false,
    errorMessage: null,
    language: 'pl',
    authenticated: false,
    token: null
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_USER_PHONE:
            return {
                ...state,
                phone: action.value
            };
        case UPDATE_USER_CODE:
            return {
                ...state,
                code: action.value
            };
        case SUBMIT_USER_PHONE:
            return {
                ...state,
                phoneSubmit: true
            };
        case SUBMIT_USER_CODE:
            return {
                ...state,
                authenticated: true,
                token: action.value
            };
        case CHANGE_LANGUAGE:
            return {
                ...state,
                language: action.value
            };
        case ERROR:
            return {
                ...state,
                error: action.error,
                errorMessage: action.message
            };
        default:
            return state;
    }
};

export default reducer;
