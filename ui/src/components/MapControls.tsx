import * as React from 'react';
import { Form, Container } from 'react-bootstrap';
import {DisplayOverlaySwitch} from "./DisplayOverlaySwitch";
import {TransitOverlaySelector} from "./TransitOverlaySelector";
import {Map as LeafletMap} from "react-leaflet";

export interface MapControlsProps {
    onDisplayChange(key: string, value: boolean): any,
    onRouteOverlayChange(routeName : string, newIsVisible : boolean): any,
}

export class MapControls extends React.Component<MapControlsProps, {}> {
    render(){
        return (
            <Container fluid>
                <Form>
                    <DisplayOverlaySwitch title="Regions" name="regions" onChange={this.props.onDisplayChange} />
                    <DisplayOverlaySwitch title="Transit Lines" name="transit" onChange={this.props.onDisplayChange} />
                    <DisplayOverlaySwitch title="Census Tracts" name="census" onChange={this.props.onDisplayChange} />
                    <TransitOverlaySelector onOverlayUpdate={this.props.onRouteOverlayChange} />
                </Form>
            </Container>
        );
    }
}