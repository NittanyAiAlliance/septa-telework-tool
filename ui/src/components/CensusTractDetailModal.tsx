import * as React from 'react';
import {Modal, Row, Col, Container, Form} from 'react-bootstrap';
import {TransitRoute} from "./MapView";
import {GeoJSON, Map as LeafletMap, TileLayer} from "react-leaflet";
import {CensusTract} from "../types/CensusTract";
import {Feature} from "geojson";
import {Layer} from "leaflet";
import {DisplayOverlaySwitch} from "./DisplayOverlaySwitch";


export interface CensusTractDetailModalProps {
    onClose() : void,
    censusTract : CensusTract
}

export interface CensusTractDetailModalState {
    //What routes has the user decided to look at?
    displayedRoutes : TransitRoute[],
    showRoutes : boolean
}

export class CensusTractDetailModal extends React.Component<CensusTractDetailModalProps, CensusTractDetailModalState> {
    constructor(props : CensusTractDetailModalProps){
        super(props);
        this.handleRouteVisibleToggle = this.handleRouteVisibleToggle.bind(this);
        this.state = {
            displayedRoutes : this.props.censusTract.intersectingRoutes,
            showRoutes : false
        }
    }

    handleRouteVisibleToggle(route : string, isVisible : boolean) {
        this.state.displayedRoutes.forEach( (thisRoute : TransitRoute, i : number) => {
            if(thisRoute.name == route){
                let displayedRoutes = [...this.state.displayedRoutes];
                displayedRoutes[i] = {
                    name : route,
                    visible : isVisible,
                    data : thisRoute.data,
                    type : thisRoute.type
                } as TransitRoute;
                this.setState({displayedRoutes : displayedRoutes})
            }
        });
    }

    render() {
        const censusTract = this.props.censusTract;
        const intersectingRoutesData: JSX.Element[] = [];
        const intersectingRoutesSwitch: JSX.Element[] = [];
        this.state.displayedRoutes.forEach((route : TransitRoute) => {
            if(route.visible){
                intersectingRoutesData.push(
                    <GeoJSON
                        data={route.data as any}
                        style={(feature : Feature) => {
                            return {
                                color : feature.properties.stroke,
                                weight : 5
                            }
                        }}
                        onEachFeature={(feature : Feature, layer : Layer) => {
                            const formattedTransitType = route.type.charAt(0).toUpperCase() + route.type.slice(1);
                            const popupContent = `
                                <Popup>
                                    <h6 class="text-center">${formattedTransitType}</p>
                                    <h4 class="text-center">${route.name}</h4>
                                </Popup>`;
                            layer.bindPopup(popupContent);
                        }}
                    />
                );
            }
            intersectingRoutesSwitch.push(
                <DisplayOverlaySwitch name={route.name} title={route.name} onChange={this.handleRouteVisibleToggle} checked={route.visible}/>
            );
        });
        return (
            <Modal show={true} onHide={this.props.onClose} dialogClassName="modal-90w" aria-labelledby="Census Tract Details">
                <Modal.Header closeButton>
                    <Modal.Title>{censusTract.name} Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mt-sm-4">
                        <Col sm={9}>
                            <LeafletMap>
                                <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMaps</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                <GeoJSON
                                    data={censusTract.feature}
                                    style={() => {
                                        return {
                                            fillColor: '#ffffff',
                                            color: '#1f2021',
                                            weight: 2,
                                            fillOpacity: 0.4,
                                        }
                                    }}
                                />
                                { this.state.showRoutes && intersectingRoutesData }
                            </LeafletMap>
                        </Col>
                        <Col sm={3}>
                            <Container fluid>
                                <Form>
                                    { intersectingRoutesSwitch }
                                </Form>
                            </Container>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    }
}
