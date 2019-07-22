import axios from "axios";

export const UPDATE_USER_PHONE = 'UPDATE_USER_PHONE';
export const UPDATE_USER_CODE = 'UPDATE_USER_CODE';
export const SUBMIT_USER_PHONE = 'SUBMIT_USER_PHONE';
export const SUBMIT_USER_CODE = 'SUBMIT_USER_CODE';
export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';
export const ERROR = 'ERROR';


export const sendUserPhone = (phone) => {
    return async (dispatch, getState) => {
        let response = await axios.post('http://localhost:4000/api/login/client', {
            phone: phone
        }, {
            headers: {
                'Accept-Language': getState().language,
                'Content-Language': getState().language
            }
        });
        let data = response.data;
        if (data.error) {
            dispatch({type: 'ERROR', error: data.error, message: data.message})
        } else {
            dispatch({type: SUBMIT_USER_PHONE})
        }
    }
};

export const sendUserCode = (phone, code) => {
    return async (dispatch, getState) => {
        let response = await axios.post('http://localhost:4000/api/login/code', {
            phone: phone,
            code: code
        }, {
            headers: {
                'Accept-Language': getState().language,
                'Content-Language': getState().language
            }
        });
        let data = response.data;
        if (data.error) {
            dispatch({type: 'ERROR', error: data.error, message: data.message})
        } else {
            dispatch({type: SUBMIT_USER_CODE, value: data.data})
        }
    }
};
