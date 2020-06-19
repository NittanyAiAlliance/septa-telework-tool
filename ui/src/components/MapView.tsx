import * as React from 'react';
import {Map as LeafletMap, GeoJSON, TileLayer} from 'react-leaflet';
import * as regionData from '../../assets/PHL_ZIP.json';
import * as limitData from '../../assets/PHL_LMT.json';
import * as stopData from '../../assets/SEPTA_LINE.json';
import * as censusData from '../../assets/PHL_CENSUS.json';
import {Feature} from "geojson";
import {Layer, popup} from "leaflet";
import {Col, Container, Row} from "react-bootstrap";
import {MapControls} from "./MapControls";

export interface MapViewProps {}

export class MapView extends React.Component<MapViewProps, {}> {
    state = {
        displayRegion : false,
        displayTransit: false,
        displayCensusTract: false
    }
    constructor(props: MapViewProps){
        super(props);
        this.toggleDisplayState=this.toggleDisplayState.bind(this);
    }

    regionGeoJSONStyle(feature : Feature) {
        return {
            fillColor: '#ffffff',
            color: '#1f2021',
            weight: 2,
            fillOpacity: 0.4,
        }
    }

    transitGeoJSONStyle(feature : Feature){
        return {
            color : feature.properties.COLOR,
            weight : 5
        }
    }

    limitGeoJSONStyle(feature : Feature) {
        return {
            fill: false,
            color : '#000000',
            weight: 4
        }
    }

    onEachRegionFeature(feature : Feature, layer : Layer) {
        const popupContent = ` <Popup><p>Zip Code: ${feature.properties.CODE}</pre></Popup>`;
        layer.bindPopup(popupContent);
    }

    onEachTransitLineFeature(feature : Feature, layer : Layer) {
        const popupContent = ` <Popup><p>Transit Line : ${feature.properties.LINE_NAME}<pre/></p></Popup>`;
        layer.bindPopup(popupContent);
    }

    onEachCensusFeature(feature : Feature, layer : Layer) {
        const popupContent = ` <Popup><p>${feature.properties.NAMELSAD10}</pre></p></Popup>`;
        layer.bindPopup(popupContent);
    }

    onLimitFeature(feature : Feature, layer : Layer) {
        const popupContent = ` <Popup><p>City Limits</p></Popup>`;
        layer.bindPopup(popupContent);
    }

    toggleDisplayState(key: string, value: boolean) {
        if (key == "regions") {
            this.setState({
                displayRegion: value,
            });
        } else if (key == "transit"){
            this.setState({
                displayTransit: value
            })
        } else if (key == "census"){
            this.setState({
                displayCensusTract: value
            });
        }
    }

    render() {
        const mapDefault = {
            lat : 39.9526,
            lng : -75.1652,
            zoom : 10
        };
        const position = {lat: mapDefault.lat, lng: mapDefault.lng};
        return (
            <Container fluid>
                <Row className="mt-sm-4">
                    <Col sm={9}>
                        <LeafletMap center={position} zoom = {mapDefault.zoom}>
                            <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMaps</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            <GeoJSON data={limitData as any} style={this.limitGeoJSONStyle} onEachFeature={this.onLimitFeature}/>
                            { this.state.displayRegion && <GeoJSON data={regionData as any} style={this.regionGeoJSONStyle} onEachFeature={this.onEachRegionFeature} /> }
                            { this.state.displayTransit && <GeoJSON data={stopData as any} style={this.transitGeoJSONStyle} onEachFeature={this.onEachTransitLineFeature} /> }
                            { this.state.displayCensusTract && <GeoJSON data={censusData as any} style={this.regionGeoJSONStyle} onEachFeature={this.onEachCensusFeature} /> }
                        </LeafletMap>
                    </Col>
                    <Col sm={3}>
                        <MapControls onDisplayChange={this.toggleDisplayState}/>
                    </Col>
                </Row>
            </Container>

        );
    }
}