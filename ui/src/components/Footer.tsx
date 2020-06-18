import * as React from 'react';
import { Container } from 'react-bootstrap';

export interface FooterProps {}

export class Footer extends React.Component<FooterProps, {}> {
    render() {
        return (
            <footer>
                <Container fluid>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eu interdum sem. Mauris sit amet tempus libero, at feugiat nulla.</p>
                </Container>
            </footer>
        );
    }
}