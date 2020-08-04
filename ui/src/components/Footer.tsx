import * as React from 'react';
import { Container, Jumbotron } from 'react-bootstrap';

export interface FooterProps {}

export class Footer extends React.Component<FooterProps, {}> {
    render() {
        return (
            <Jumbotron>
                <Container fluid className="mb-sm-5">
                    <h6>&nbsp;</h6>
                </Container>
            </Jumbotron>
        );
    }
}