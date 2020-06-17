import * as React from 'react';
import { Container, Jumbotron, Row, Col } from 'react-bootstrap';
import {TeleworkMap} from "./TeleworkMap";

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
                <Container fluid>
                    <h3 className="mb-sm-4">Philadelphia Telework Forecasting Map</h3>
                    <TeleworkMap />
                </Container>
            </main>
        );
    }
}