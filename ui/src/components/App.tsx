import * as React from 'react';
import {Route, Switch} from "react-router";
import {HomePage} from "./HomePage";
import {AIPage} from "./AIPage";
import {InterpretationPage} from "./InterpretationPage";
import {NavigationBar} from "./NavigationBar";

export interface AppProps {}

export class App extends React.Component<AppProps, {}> {
    render() {
        return (
            <div>
                <NavigationBar />
                <Switch>
                    <Route exact path='/' component = {HomePage} />
                    <Route exact path='/ai' component = {AIPage} />
                    <Route exact path='/interpretation' component = {InterpretationPage} />
                    <Route component= {HomePage} />
                </Switch>
            </div>
        );
    }
}