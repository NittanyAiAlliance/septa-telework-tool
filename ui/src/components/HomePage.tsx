import * as React from 'react';
import { Container, Jumbotron, Row, Col } from 'react-bootstrap';
import {Footer} from "./Footer";
import {MapView} from "./MapView";

export interface HomePageProps { }

export class HomePage extends React.Component<HomePageProps, {}> {
    render() {
        return(
            <main>
                <Jumbotron fluid>
                    <Container>
                        <h1>SEPTA Future Telework Forecasting Tool</h1>
                    </Container>
                </Jumbotron>
                <MapView />
                <Footer />
            </main>
        );
    }
}