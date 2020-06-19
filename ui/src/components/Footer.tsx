import * as React from 'react';
import { Container, Jumbotron } from 'react-bootstrap';

export interface FooterProps {}

export class Footer extends React.Component<FooterProps, {}> {
    render() {
        return (
            <Jumbotron>
                <Container fluid className="mb-sm-5">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eu interdum sem. Mauris sit amet tempus libero, at feugiat nulla.</p>
                </Container>
            </Jumbotron>
        );
    }
}