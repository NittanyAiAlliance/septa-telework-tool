import * as React from 'react';
import {TransitRoute} from "./MapView";
import { Modal, Row, Col, Container, DropdownButton, Dropdown } from 'react-bootstrap';
import {bbox} from "@turf/turf";
import {GeoJSON, Map as LeafletMap, TileLayer} from "react-leaflet";
import {CensusTract} from "../types/CensusTract";
import {Layer} from "leaflet";
import {Feature} from "geojson";
import DataTable from "react-data-table-component";

export interface TransitLineDetailModalProps {
    show : boolean,
    onClose() : void,
    transitLine : TransitRoute
}

export interface TransitLineDetailModalState {
    show : boolean,
    showStops : boolean,
    featureBounds : any,
    modalReady : boolean,
    tracts : CensusTract[],
    tractData : any[];
}

export class TransitLineDetailModal extends React.Component<TransitLineDetailModalProps, TransitLineDetailModalState> {
    constructor(props : TransitLineDetailModalProps) {
        super(props);
        let transitLineFeature = this.props.transitLine.data as any;
        const bboxArray = bbox(transitLineFeature);
        const latMid = (bboxArray[3] - bboxArray[1]) / 2 + bboxArray[1];
        const lngMid = (bboxArray[2] - bboxArray[0]) / 2 + bboxArray[0];
        this.state = {
            show : this.props.show,
            showStops : false,
            featureBounds : { lat : latMid, lng : lngMid},
            modalReady : false,
            tracts : null,
            tractData : null
        }
        this.handleTractSelection = this.handleTractSelection.bind(this);
        this.exportSelected = this.exportSelected.bind(this);
    }

    componentDidMount() {
        this.grabRiskValues();
        this.renderMap();
    }

    renderMap(){
        //Load the map 200MS after the modal because Leaf
        setTimeout(()=>{
            this.setState({
                modalReady : true
            });
        }, 200);
    }

    grabRiskValues(){
        let tracts = [] as CensusTract[];
        let tractData = [] as any[];
        fetch('/assets/data/data.json')
            .then(response => response.json())
            .then(data => {
                this.props.transitLine.intersectingTracts.forEach((tract : CensusTract) => {
                    tract.riskValue = data[tract.feature.properties.NAMELSAD10.replace("Census Tract ", "")];
                    tracts.push(tract);
                    tractData.push({
                        name : parseFloat(tract.name.replace("Census Tract ", "")),
                        prediction : tract.riskValue ? tract.riskValue.toFixed(6) : tract.riskValue
                    });
                });
                this.setState({tracts : tracts, tractData : tractData});
            });
    }

    getRiskColor(perc : number, max : number, min : number){
        perc = 1 - perc;
        var base = (max - min);

        perc = perc * 100;

        if (base == 0) { perc = 100; }
        else {
            perc = (perc - min) / base * 100;
        }
        var r, g, b = 0;
        if (perc < 50) {
            r = 255;
            g = Math.round(5.1 * perc);
        }
        else {
            g = 255;
            r = Math.round(510 - 5.10 * perc);
        }
        var h = r * 0x10000 + g * 0x100 + b * 0x1;
        return '#' + ('000000' + h.toString(16)).slice(-6);
    }

    exportSelected(all : boolean){
        let exportOutput = [] as any[];
        fetch('/assets/data/extended-data.json')
            .then(response => response.json())
            .then(data => {
                data.forEach((val : any) => {
                    this.state.tracts.forEach((value) => {
                        if(value.name == val.name && (all || value.selected)){
                            exportOutput.push(val);
                        }
                    });
                });
                var pom = document.createElement('a');
                pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportOutput)));
                pom.setAttribute('download', 'export.json');

                if (document.createEvent) {
                    var event = document.createEvent('MouseEvents');
                    event.initEvent('click', true, true);
                    pom.dispatchEvent(event);
                }
                else {
                    pom.click();
                }
            });
    }

    handleTractSelection(rowState : any){
        let rows = rowState.selectedRows;
        let newTracts = this.state.tracts.slice(0);
        for(let j = 0; j < newTracts.length; j++){
            newTracts[j].selected = false;
        }
        rows.forEach((row : any) => {
            for(let i = 0; i < newTracts.length; i++) {
                let thisTract = newTracts[i];
                if(row.name == thisTract.name.replace("Census Tract ", '')){
                    newTracts[i].selected = true;
                }
            }
        });
        this.setState({tracts : newTracts});
    }

    render() {
        const transitLine = this.props.transitLine;
        let intersectingTracts = [] as any[];
        let tractData = [] as any[];
        if(this.state.tracts) {
            this.state.tracts.forEach((tract) => {
                intersectingTracts.push(
                    <GeoJSON
                        data={tract.feature}
                        style={() => {
                            return {
                                fillColor: tract.selected ? this.getRiskColor(tract.riskValue, 100, 50) : '#FFFFFF',
                                color: '#1f2021',
                                weight: 2,
                                fillOpacity: tract.selected ? 0.6 : 0.4,
                            }
                        }}
                        onEachFeature={(feature: Feature, layer: Layer) => {
                            const namePopup = `<Popup><p>${tract.name}</p></Popup>`;
                            layer.bindPopup(namePopup);
                        }}
                    />);
            });
        }
        return (
            <Modal show={this.state.show} onHide={this.props.onClose} dialogClassName="modal-80w">
                <Modal.Header closeButton>
                    <Modal.Title>Route {transitLine.name} : {(transitLine.data as any).properties.Route_Name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col sm={7}>
                            {
                                this.state.modalReady &&
                                <LeafletMap center={this.state.featureBounds} zoom={11} style={{height: "80vh"}}>
                                    <TileLayer
                                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMaps</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                    { intersectingTracts }
                                    { intersectingTracts &&
                                    <GeoJSON
                                        data={transitLine.data as any}
                                        style={() => {
                                            return {
                                                color: '#FF0000',
                                            }
                                        }}
                                    />
                                    }
                                </LeafletMap>
                            }
                        </Col>
                        <Col sm={5}>
                            <Container fluid>
                                <DropdownButton id="exportDropdown" title="Export">
                                    <Dropdown.Item as="button" onClick={() => {this.exportSelected(true)}}>Export All Tracts</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={() => {this.exportSelected(false)}}>Export Selected Tracts</Dropdown.Item>
                                </DropdownButton>
                            </Container>
                            <Container fluid style={{maxHeight : "80vh", overflowY : "auto"}}>
                                {
                                    this.state.tracts &&
                                    <DataTable
                                        title="Route Projections"
                                        style={{height : "100%"}}
                                        columns={[
                                            {
                                                name : 'Tract',
                                                selector : 'name',
                                                sortable : true
                                            },
                                            {
                                                name : 'Risk Factor',
                                                selector : 'prediction',
                                                sortable : true
                                            }
                                        ]}
                                        data={this.state.tractData}
                                        selectableRows
                                        onSelectedRowsChange={this.handleTractSelection}
                                        pagination
                                    />
                                }
                            </Container>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    }
}