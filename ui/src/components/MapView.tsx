import * as React from 'react';
import {Map as LeafletMap, GeoJSON, TileLayer} from 'react-leaflet';
import * as regionData from '../../assets/PHL_ZIP.json';
import * as limitData from '../../assets/PHL_LMT.json';
import * as censusData from '../../assets/PHL_CENSUS.json';
import {Feature} from "geojson";
import {Layer, popup} from "leaflet";
import {Col, Container, Row} from "react-bootstrap";
import {MapControls} from "./MapControls";
import * as routes from '../../assets/PHL_ROUTES.json';

export interface TransitRoute {
    name : string,
    data : object,
    visible : boolean,
    type : string
}

export interface MapViewProps {}
export interface MapViewState {
    displayRegion : boolean,
    displayTransit: boolean,
    displayCensusTract: boolean,
    displayedRoutes : TransitRoute[]
}


export class MapView extends React.Component<MapViewProps, MapViewState> {
    state = {
        displayRegion: false,
        displayTransit : true,
        displayCensusTract : false,
        displayedRoutes : [] as TransitRoute[]
    } as MapViewState;

    constructor(props: MapViewProps){
        super(props);
        this.toggleDisplayState=this.toggleDisplayState.bind(this);
        this.handleRouteOverlayUpdate = this.handleRouteOverlayUpdate.bind(this);
        routes["bus-routes"].forEach((route) => {
            this.state.displayedRoutes.push({
                name : route,
                visible : false,
                data : {},
                type : "bus"
            } as TransitRoute);
        });
        routes["train-routes"].forEach((route) => {
            this.state.displayedRoutes.push({
                name : route,
                visible : false,
                data : {},
                type : "train"
            });
        });
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
            color : feature.properties.stroke,
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

    async handleRouteOverlayUpdate(routeName : string, newIsVisible : boolean) {
        for(let i : number = 0; i < this.state.displayedRoutes.length; i++) {
            let thisRoute = this.state.displayedRoutes[i];
            if(thisRoute.name == routeName){
                fetch('/ui/assets/routes/' + thisRoute.name + '.geojson')
                    .then(response => response.json())
                    .then( data => {
                        let displayedRoutes = [...this.state.displayedRoutes];
                        displayedRoutes[i] = {
                            name : routeName,
                            visible : newIsVisible,
                            data : data,
                            type : thisRoute.type
                        } as TransitRoute;
                        this.setState({displayedRoutes : displayedRoutes})
                        console.log(this.state.displayedRoutes);
                    });
            }
        }
    }

    render() {
        const mapDefault = {
            lat : 39.9526,
            lng : -75.1652,
            zoom : 10
        };
        const position = {lat: mapDefault.lat, lng: mapDefault.lng};
        const displayedRoutes = [];
        for(const [index, value] of this.state.displayedRoutes.entries()){
            if(value.visible) {
                const transitLineOverlay =
                    <GeoJSON
                        data={value.data as any}
                        style={this.transitGeoJSONStyle}
                        onEachFeature={(feature : Feature, layer : Layer) => {
                            const popupContent = ` <Popup><p>${value.type.toUpperCase()}: ${value.name}<pre/></p></Popup>`;
                            layer.bindPopup(popupContent);
                        }}
                    />
                displayedRoutes.push(transitLineOverlay);
            }
        }
        return (
            <Container fluid>
                <Row className="mt-sm-4">
                    <Col sm={9}>
                        <LeafletMap center={position} zoom = {mapDefault.zoom}>
                            <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMaps</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            <GeoJSON data={limitData as any} style={this.limitGeoJSONStyle} onEachFeature={this.onLimitFeature}/>
                            { this.state.displayRegion && <GeoJSON data={regionData as any} style={this.regionGeoJSONStyle} onEachFeature={this.onEachRegionFeature} /> }
                            { this.state.displayCensusTract && <GeoJSON data={censusData as any} style={this.regionGeoJSONStyle} onEachFeature={this.onEachCensusFeature} /> }
                            { this.state.displayTransit && displayedRoutes }
                        </LeafletMap>
                    </Col>
                    <Col sm={3}>
                        <MapControls onDisplayChange={this.toggleDisplayState} onRouteOverlayChange={this.handleRouteOverlayUpdate} displayedRoutes={this.state.displayedRoutes}/>
                    </Col>
                </Row>
            </Container>

        );
    }
}