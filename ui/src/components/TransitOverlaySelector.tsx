import * as React from 'react';
import * as routes from '../../assets/PHL_ROUTES.json';
import { Button, Modal, Container } from 'react-bootstrap';
import {DisplayOverlaySwitch} from "./DisplayOverlaySwitch";

export interface TransitOverlayModalProps {
    onUpdate(routeName : string, newIsVisible : boolean) : any,
}

export class TransitOverlaySelector extends React.Component<TransitOverlayModalProps, {}> {
    state = {
        showModal : false,
    };

    openModal(){
        this.setState({showModal : true});
    }

    closeModal(){
        this.setState({showModal : true});
    }

    handleUpdateRoute(key : string, value : boolean) {
        this.props.onUpdate(key, value);
    }

    render() {
        const busRoutes = routes["bus-routes"];
        const trainRoutes = routes["train-routes"];
        return (
            <div>
                <Button onClick={this.openModal}>
                    Select Routes
                </Button>
                <Modal show={this.state.showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Transit Route Overlays</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Container fluid>
                            <h1>Bus Routes:</h1>
                            {
                                busRoutes.map((value : string, index : number) => {
                                    return <DisplayOverlaySwitch title={value} name={value} onChange={this.handleUpdateRoute} />;
                                })
                            }
                            <h1>Train Routes:</h1>
                            {
                                trainRoutes.map((value : string, index : number) => {
                                    return <DisplayOverlaySwitch title={value} name={value} onChange={this.handleUpdateRoute} />
                                })
                            }
                        </Container>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}