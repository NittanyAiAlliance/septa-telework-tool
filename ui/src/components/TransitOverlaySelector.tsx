import * as React from 'react';
import { Button, Modal, Container } from 'react-bootstrap';
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

    openModal(){
        this.setState({showModal : true});
    }

    closeModal(){
        this.setState({showModal : false});
    }

    handleUpdateRoute(key : string, value : boolean) {
        this.props.onOverlayUpdate(key, value);
    }

    render() {
        const busRoutes = [];
        for(const [index, value] of this.props.displayedRoutes.entries()){
            busRoutes.push(<DisplayOverlaySwitch title={value.name} name={value.name} onChange={this.handleUpdateRoute} checked={value.visible} />);
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
                        <Container fluid>
                            <h1>Bus Routes:</h1>
                            { busRoutes }
                        </Container>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}