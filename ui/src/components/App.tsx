import * as React from 'react';
import {Route, Switch} from "react-router";
import {HomePage} from "./HomePage";

export interface AppProps {}

export class App extends React.Component<AppProps, {}> {
    render() {
        return (
            <div>
                <Switch>
                    <Route exact path='/' component = {HomePage} />
                    <Route component= {HomePage} />
                </Switch>
            </div>
        );
    }
}