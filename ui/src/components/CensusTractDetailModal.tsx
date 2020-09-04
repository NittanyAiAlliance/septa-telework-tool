import * as React from 'react';
import {Modal, Row, Col, Container, Form, Table} from 'react-bootstrap';
import {TransitRoute} from "./MapView";
import {GeoJSON, Map as LeafletMap, Marker, Popup, TileLayer} from "react-leaflet";
import {CensusTract} from "../types/CensusTract";
import {Feature} from "geojson";
import {Layer} from "leaflet";
import {DisplayOverlaySwitch} from "./DisplayOverlaySwitch";
import {createRef} from "react";
import {bbox} from "@turf/turf";
import {TransitStop} from "../types/TransitStop";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;


export interface CensusTractDetailModalProps {
    show : boolean,
    onClose() : void,
    censusTract : CensusTract
}

export interface CensusTractDetailModalState {
    //What routes has the user decided to look at?
    displayedRoutes : TransitRoute[],
    show : boolean,
    featureBounds : any //LatLngTuple,
    modalReady : boolean,
    showStops : boolean,
    details : any //Detailed results csv data
}

export class CensusTractDetailModal extends React.Component<CensusTractDetailModalProps, CensusTractDetailModalState> {
    mapRef = createRef<LeafletMap>();

    constructor(props : CensusTractDetailModalProps){
        super(props);
        this.handleRouteVisibleToggle = this.handleRouteVisibleToggle.bind(this);
        this.handleStopVisibleToggle = this.handleStopVisibleToggle.bind(this);
        const bboxArray = bbox(this.props.censusTract.feature);
        const latMid = (bboxArray[3] - bboxArray[1]) / 2 + bboxArray[1];
        const lngMid = (bboxArray[2] - bboxArray[0]) / 2 + bboxArray[0];
        this.state = {
            displayedRoutes : this.props.censusTract.intersectingRoutes,
            show : this.props.show,
            featureBounds : {lat : latMid, lng : lngMid},
            modalReady : false,
            showStops : false,
            details : null
        }
    }

    async handleRouteVisibleToggle(route : string, isVisible : boolean) {
        for (const thisRoute of this.state.displayedRoutes) {
            let i: number = this.state.displayedRoutes.indexOf(thisRoute);
            if(thisRoute.name == route){
                try {
                    fetch('/assets/stops/' + thisRoute.name + '.json')
                        .then(response => response.json())
                        .then(data => {
                            const stops : TransitStop[] = [];
                            try{
                                for (const stop of data) {
                                    stops.push({
                                        route : thisRoute.name,
                                        lat : stop.lat,
                                        lng : stop.lng,
                                        name : stop.stopname
                                    } as TransitStop );
                                }
                            } catch(ex) {

                            }
                            let displayedRoutes = [...this.state.displayedRoutes];
                            displayedRoutes[i] = {
                                name : route,
                                visible : isVisible,
                                data : thisRoute.data,
                                type : thisRoute.type,
                                stops : stops ? stops : []
                            } as TransitRoute;
                            this.setState({displayedRoutes : displayedRoutes});
                        }).catch((error) => {
                        let displayedRoutes = [...this.state.displayedRoutes];
                        displayedRoutes[i] = {
                            name : route,
                            visible : isVisible,
                            data : thisRoute.data,
                            type : thisRoute.type,
                            stops : []
                        } as TransitRoute;
                        this.setState({displayedRoutes : displayedRoutes});
                    });
                } catch (ex) {

                }
            }
        }
    }

    handleStopVisibleToggle(option : string, newValue : boolean){
        this.setState({
            showStops : newValue
        });
    }

    componentDidMount() {
        //Leaflet cannot properly render the map, so, we wait 200MS, which is plenty of time for the modal to load, then we load the map
        this.renderMap();
        this.loadDetailedResults()
    }

    renderMap(){
        //Load the map 200MS after the modal because Leaf
        setTimeout(()=>{
            this.setState({
                modalReady : true
            });
        }, 200);
    }

    loadDetailedResults(){
        fetch('/assets/data/extended-data.json')
            .then(response => response.json())
            .then(data => {
                data.forEach((val : any) => {
                    if(val.name == this.props.censusTract.name){
                        this.setState({details : val});
                    }
                });
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
                                color : "#FF0000",
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
                if(this.state.showStops){
                    route.stops.forEach((stop) => {
                        intersectingRoutesData.push(
                            <Marker position={[stop.lat, stop.lng]}>
                                <Popup>{stop.name}</Popup>
                            </Marker>
                        )
                    });
                }
            }
            intersectingRoutesSwitch.push(
                <DisplayOverlaySwitch name={route.name} title={route.name} onChange={this.handleRouteVisibleToggle} checked={route.visible}/>
            );
        });
        return (
            <Modal show={this.state.show} onHide={() => {this.setState({show : false}); this.props.onClose()}} dialogClassName="modal-80w" aria-labelledby="Census Tract Details">
                <Modal.Header closeButton>
                    <Modal.Title>{censusTract.name} Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mt-sm-4">
                        <Col sm={9}>
                            {
                                this.state.modalReady &&
                            <LeafletMap center={this.state.featureBounds} zoom={13} style={{height: "80vh"}}
                                        ref={this.mapRef}>
                                <TileLayer
                                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMaps</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
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
                                { intersectingRoutesData }
                            </LeafletMap>
                            }
                        </Col>
                        <Col sm={3}>
                            <Container fluid>
                                <h5>Routes: </h5>
                            </Container>
                            <Container fluid>
                                <Form>
                                    { intersectingRoutesSwitch }
                                </Form>
                            </Container>
                            <Container fluid className="mt-sm-4">
                                <h5>Options: </h5>
                            </Container>
                            <Container fluid>
                                <Form>
                                    <DisplayOverlaySwitch title={"Stops"} name={"stop-toggle"} onChange={this.handleStopVisibleToggle} />
                                </Form>
                            </Container>
                        </Col>
                    </Row>
                    <Row className="mt-sm-4">
                        <Container fluid style={{overflowX: "scroll"}}>
                            {
                                this.state.details &&
                                    <Table bordered>
                                        <thead>
                                            <tr>
                                                <th>Telework Risk Factor</th>
                                                <th>Adult Population</th>
                                                <th>Agriculture</th>
                                                <th>Construction</th>
                                                <th>Manufacturing</th>
                                                <th>Wholesale Trade</th>
                                                <th>Retail Trade</th>
                                                <th>Transportation</th>
                                                <th>Information</th>
                                                <th>Financial Services</th>
                                                <th>Professional/Administrative</th>
                                                <th>Healthcare and Education</th>
                                                <th>Arts and Entertainment</th>
                                                <th>Other</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><strong>{this.state.details.prediction}</strong></td>
                                                <td>{this.state.details.adult_population}</td>
                                                <td>{this.state.details.agriculture}</td>
                                                <td>{this.state.details.construction}</td>
                                                <td>{this.state.details.manufacturing}</td>
                                                <td>{this.state.details.wholesale}</td>
                                                <td>{this.state.details.retail}</td>
                                                <td>{this.state.details.transportation}</td>
                                                <td>{this.state.details.information}</td>
                                                <td>{this.state.details.finance}</td>
                                                <td>{this.state.details.professional}</td>
                                                <td>{this.state.details.social_services}</td>
                                                <td>{this.state.details.arts}</td>
                                                <td>{this.state.details.other}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                            }
                        </Container>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    }
}
