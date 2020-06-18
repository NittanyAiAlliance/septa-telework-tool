import * as React from 'react';
import { Form, Container } from 'react-bootstrap';
import {DisplayOverlaySwitch} from "./DisplayOverlaySwitch";

export interface MapControlsProps {
    onDisplayChange(key: string, value: boolean): any
}

export class MapControls extends React.Component<MapControlsProps, {}> {
    render(){
        return (
            <Container fluid>
                <h3>Map Controls<hr/></h3>
                <Container fluid>
                    <Form>
                        <DisplayOverlaySwitch title="Regions" name="regions" onChange={this.props.onDisplayChange} />
                        <DisplayOverlaySwitch title="Transit Lines" name="transit" onChange={this.props.onDisplayChange} />
                    </Form>
                </Container>
            </Container>
        );
    }
}