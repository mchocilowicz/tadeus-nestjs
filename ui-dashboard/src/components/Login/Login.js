import React from 'react'
import {connect} from 'react-redux';
import {sendUserCode, sendUserPhone, UPDATE_USER_CODE, UPDATE_USER_PHONE} from "../../store/actions";
import CodeForm from "./CodeForm";
import PhoneForm from "./PhoneForm";

class LoginPage extends React.Component {

    phoneChange = (phoneEvent) => {
        this.props.onPhoneChange(phoneEvent.target.value)
    };

    codeChange = (codeEvent) => {
        this.props.onCodeChange(codeEvent.target.value)
    };

    onPhoneFormButtonClick = () => {
        this.props.onPhoneFormSubmit(this.props.phone);
    };

    onCodeFormButtonClick = () => {
        this.props.onCodeFormSubmit(this.props.phone, this.props.code);
    };

    render() {
        if (this.props.authenticated) {
            return (
                <h2>DUPA 12</h2>
            )
        } else if (this.props.phoneSubmit) {
            return (
                <CodeForm
                    code={this.props.code}
                    codeChange={this.codeChange}
                    onCodeFormButtonClick={this.onCodeFormButtonClick}
                />
            )
        } else {
            return (
                <PhoneForm
                    phone={this.props.phone}
                    phoneChange={this.phoneChange}
                    onPhoneFormButtonClick={this.onPhoneFormButtonClick}
                />
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        phone: state.phone,
        code: state.code,
        phoneSubmit: state.phoneSubmit,
        authenticated: state.authenticated
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onPhoneChange: (phone) => dispatch({type: UPDATE_USER_PHONE, value: phone}),
        onCodeChange: (code) => dispatch({type: UPDATE_USER_CODE, value: code}),
        onPhoneFormSubmit: (phone) => dispatch(sendUserPhone(phone)),
        onCodeFormSubmit: (phone, code) => dispatch(sendUserCode(phone, code))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
