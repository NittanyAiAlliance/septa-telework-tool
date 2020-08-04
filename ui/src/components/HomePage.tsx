import * as React from 'react';
import { Container, Jumbotron } from 'react-bootstrap';
import {MapView} from "./MapView";

export interface HomePageProps { }

export class HomePage extends React.Component<HomePageProps, {}> {
    render() {
        return(
            <main>
                <Jumbotron fluid>
                    <Container fluid>
                        <h1>SEPTA Future Telework Forecasting Tool</h1>
                    </Container>
                </Jumbotron>
                <Container fluid className="p-0 m-0">
                    <h3 className="top-bottom-grey-border pt-3 pb-3 pl-0 pr-0">Philadelphia Telework Forecasting Map</h3>
                    <MapView />
                </Container>
            </main>
        );
    }
}