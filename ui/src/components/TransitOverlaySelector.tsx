import * as React from 'react';
import { Button, Modal, Container, Row, Col } from 'react-bootstrap';
import {DisplayOverlaySwitch} from "./DisplayOverlaySwitch";
import {TransitRoute} from "./MapView";
import {GeoJSON} from "react-leaflet";

export interface TransitOverlayModalProps {
    onOverlayUpdate(routeName : string, newIsVisible : boolean) : any,
    displayedRoutes : TransitRoute[]
}

export class TransitOverlaySelector extends React.Component<TransitOverlayModalProps, {showModal : boolean}> {
    state = {
        showModal : false,
    };

    constructor(props : TransitOverlayModalProps){
        super(props);
        this.openModal=this.openModal.bind(this);
        this.closeModal=this.closeModal.bind(this);
        this.handleUpdateRoute=this.handleUpdateRoute.bind(this);
    }

    openModal() {
        this.setState({showModal : true});
    }

    closeModal() {
        this.setState({showModal : false});
    }

    handleUpdateRoute(key : string, value : boolean) {
        this.props.onOverlayUpdate(key, value);
    }

    render() {
        console.log(this.props.displayedRoutes.length);
        const busRoutes = [];
        const trainRoutes = [];
        const regionalRailRoutes = [];
        for(const [index, value] of this.props.displayedRoutes.entries()){
            const routeDisplaySwitch = <DisplayOverlaySwitch title={value.name.replace('_', "/")} name={value.name} onChange={this.handleUpdateRoute} checked={value.visible} />
            if(value.type == "bus"){
                busRoutes.push(routeDisplaySwitch);
            } else if(value.type == "train"){
                trainRoutes.push(routeDisplaySwitch);
            } else if(value.type == "Regional Rail"){
                regionalRailRoutes.push(routeDisplaySwitch);
            }
        }
        return (
            <div>
                <Button onClick={this.openModal}>
                    Select Routes
                </Button>
                <Modal size="lg" show={this.state.showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Transit Route Overlays</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>

                            </Col>
                        </Row>
                        <Container fluid>
                            <h1>Bus Routes:</h1>
                            { busRoutes }
                        </Container>
                        <Container fluid>
                            <h2>Train Routes:</h2>
                            { trainRoutes }
                        </Container>
                        <Container fluid>
                            <h2>Regional Rail Routes:</h2>
                            {regionalRailRoutes}
                        </Container>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}