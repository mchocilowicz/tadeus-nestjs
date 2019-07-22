import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';

import './i18n';
import {Provider} from "react-redux";
import {applyMiddleware, createStore} from "redux";
import reducer from "./store/reducer";
import {BrowserRouter} from "react-router-dom";
import {composeWithDevTools} from "redux-devtools-extension";
import thunk from "redux-thunk";
import {SnackbarProvider} from "notistack";

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));

const app = (
    <Suspense fallback="loading">
        <Provider store={store}>
            <SnackbarProvider maxSnack={3}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </SnackbarProvider>
        </Provider>
    </Suspense>

);

ReactDOM.render(app, document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
