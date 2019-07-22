import React from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css'
import {Route} from "react-router";
import LoginForm from "../Login/Login";
import {Button} from "semantic-ui-react";
import {connect} from "react-redux";
import {withSnackbar} from "notistack";

class App extends React.Component {
    componentDidUpdate = () => {
        console.log('componentDidUpdate');
        if (this.props.error) {
            this.props.enqueueSnackbar(this.props.errorMessage, {
                    key: new Date().getTime() + Math.random(),
                    variant: 'warning',
                    action: key => (
                        <Button onClick={() => this.props.closeSnackbar(key)}>dissmiss me</Button>
                    ),
                }
            );
        }
    };

    render() {
        return (
            <Route path="/" exact component={LoginForm}/>
        );
    }
}

const mapStateToProps = state => {
    return {
        error: state.error,
        errorMessage: state.errorMessage
    }
};

export default connect(mapStateToProps)(withSnackbar(App));
