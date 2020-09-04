import * as React from 'react';
import {Map as LeafletMap, GeoJSON, TileLayer} from 'react-leaflet';
import * as regionData from '../../assets/PHL_ZIP.json';
import * as limitData from '../../assets/PHL_LMT.json';
import {Feature} from "geojson";
import {Layer} from "leaflet";
import {Col, Container, Row, Modal} from "react-bootstrap";
import {MapControls} from "./MapControls";
import * as routes from '../../assets/PHL_ROUTES.json';
import {polygon, lineString, lineIntersect, multiLineString} from '@turf/turf';
import {CensusTractDetailModal} from "./CensusTractDetailModal";
import {CensusTract} from "../types/CensusTract";
import {TransitStop} from "../types/TransitStop";
import { TransitLineDetailModal } from './TransitLineDetailModal';

export interface TransitRoute {
    name : string,
    data : object,
    visible : boolean,
    type : string,
    stops? : TransitStop[],
    intersectingTracts? : CensusTract[];
}

export interface MapViewProps {}
export interface MapViewState {
    displayRegion : boolean,
    displayTransit: boolean,
    censusTractData : any,
    suburbsTractData : any,
    displayedRoutes : TransitRoute[],
    showCensusTractDetails : boolean,
    showLineDetails : boolean,
    selectedCensusTract : CensusTract,
    selectedServiceLine : TransitRoute
    riskValues : any
}


export class MapView extends React.Component<MapViewProps, MapViewState> {
    state = {
        displayRegion: false,
        displayTransit : true,
        censusTractData : null,
        suburbsTractData : null,
        displayedRoutes : [] as TransitRoute[],
        showCensusTractDetails : false,
        showLineDetails : false,
        riskValues : null
    } as MapViewState;

    constructor(props: MapViewProps){
        super(props);
        this.toggleDisplayState=this.toggleDisplayState.bind(this);
        this.handleRouteOverlayUpdate = this.handleRouteOverlayUpdate.bind(this);
        this.onEachCensusFeature=this.onEachCensusFeature.bind(this);
        this.riskValueToColor=this.riskValueToColor.bind(this);
        this.tractHeatStyle=this.tractHeatStyle.bind(this);
        this.suburbTractHeatStyle=this.suburbTractHeatStyle.bind(this);
    }

    regionGeoJSONStyle(feature : Feature) {
        return {
            fillColor: '#ffffff',
            color: '#1f2021',
            weight: 2,
            fillOpacity: 0.4,
        }
    }

    tractHeatStyle(feature : Feature) {
        return {
            fillColor : this.riskValueToColor(this.state.riskValues[feature.properties.NAME10], 30,100),
            color: '#1f2021',
            weight : 2,
            fillOpacity: 0.6
        }
    }

    suburbTractHeatStyle(feature : Feature){
        let tractName = feature.properties.NAMELSAD10.replace("Census Tract ", "") as string;
        return {
            fillColor : this.riskValueToColor(this.state.riskValues[tractName], 50, 100),
            color: '#1f2021',
            weight : 2,
            fillOpacity: 0.6
        }
    }

    riskValueToColor(perc : number, min : number, max : number) {
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

    transitGeoJSONStyle(feature : Feature){
        return {
            color : '#FF0000',
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

    /**
     * Assign a popup to display the zip code for each region feature
     * @param feature
     * @param layer
     */
    onEachRegionFeature(feature : Feature, layer : Layer) {
        const popupContent = ` <Popup><p>Zip Code: ${feature.properties.CODE}</pre></Popup>`;
        layer.bindPopup(popupContent);
    }

    onEachTransitLineFeature(feature : Feature, layer : Layer) {
        const popupContent = ` <Popup><p>Transit Line : ${feature.properties.LINE_NAME}<pre/></p><Button onclick={() => { this.lineSelected(feature)}</Button></Popup>`;
        layer.bindPopup(popupContent);
    }

    onEachCensusFeature(feature : Feature, layer : Layer) {
        const popupContent = `
            <Popup>
                <p>${feature.properties.NAMELSAD10}</pre></p>
            </Popup>`;
        layer.bindPopup(popupContent);
        layer.on({
            click: () => {
                let censusTract = polygon((feature as any).geometry.coordinates);
                const intersectingRoutes = [] as TransitRoute[];
                this.state.displayedRoutes.forEach((route) => {
                    try {
                        let thisRoute = multiLineString((route.data as any).geometry.coordinates);
                        const intersectionValue = lineIntersect(thisRoute, censusTract as any);
                        if(intersectionValue.features.length > 0){
                            //This route intersects the census tract, push it to the array of intersecting routes
                            intersectingRoutes.push(route);
                        }
                    } catch (ex){

                    }
                });
                this.state.selectedCensusTract = {
                    name : feature.properties.NAMELSAD10,
                    feature : feature,
                    intersectingRoutes : intersectingRoutes
                }
                this.setState({showCensusTractDetails : true});
            }
        });
    }

    onLimitFeature(feature : Feature, layer : Layer) {
        const popupContent = ` <Popup><p>City Limits</p></Popup>`;
        layer.bindPopup(popupContent);
    }

    async toggleDisplayState(key: string, value: boolean) {
        if (key == "regions") {
            this.setState({
                displayRegion: value,
            });
        } else if (key == "transit"){
            this.setState({
                displayTransit: value
            })
        } else if (key == "census"){
            if(value){
                fetch('/assets/PHL_CENSUS.json')
                    .then(response => response.json())
                    .then(data => {
                        this.setState({
                            censusTractData : data
                        });
                    });
            } else {
                this.setState({
                    censusTractData : null
                });
            }
        } else if(key == "suburbs"){
            if(value){
                fetch('/assets/suburbs.json')
                    .then(response => response.json())
                    .then(data => {
                        this.setState({
                            suburbsTractData : data
                        });
                    });
            } else {
                this.setState({
                    suburbsTractData : null
                });
            }
        }
    }

    async handleRouteOverlayUpdate(routeName : string, newIsVisible : boolean) {
        for(let i : number = 0; i < this.state.displayedRoutes.length; i++) {
            let thisRoute = this.state.displayedRoutes[i];
            if(thisRoute.name == routeName){
                let displayedRoutes = this.state.displayedRoutes.splice(0);
                displayedRoutes[i] = {
                    name : routeName,
                    visible : newIsVisible,
                    data : thisRoute.data,
                    type : thisRoute.type
                } as TransitRoute;
                this.setState({displayedRoutes : displayedRoutes})
            }
        }
    }

    componentDidMount() {
        this.fetchAllTransitRoutes().then(() => {
            console.log("done loadin routz");
        });
        fetch('/assets/data/data.json')
            .then(response => response.json())
            .then(data => {
                this.setState({riskValues : data});
            });
        this.toggleDisplayState("census", true);
        this.toggleDisplayState("suburbs", true);
    }

    async fetchAllTransitRoutes(): Promise<void> {
        routes["bus-routes"].forEach((value) => {
            fetch('/assets/routes/' + value + '.geojson')
                .then(response => response.json())
                .then(data => {
                    this.state.displayedRoutes.push({
                        name : value,
                        visible : false,
                        data : data,
                        type : 'bus'
                    } as TransitRoute );
                });
        });
        routes["train-routes"].forEach((value) => {
            fetch('/assets/routes/' + value + '.geojson')
                .then(response => response.json())
                .then(data => {
                    this.state.displayedRoutes.push({
                        name : value,
                        visible : false,
                        data : data,
                        type : 'train'
                    } as TransitRoute );
                });
        });
        routes["regional-rail"].forEach((value) => {
            fetch('/assets/routes/' + value + '.geojson')
                .then(response => response.json())
                .then(data => {
                    this.state.displayedRoutes.push({
                        name : value,
                        visible : false,
                        data : data,
                        type : 'Regional Rail'
                    } as TransitRoute);
                });
        });
    }

    showCensusTractDetails(){
        this.setState({
            showCensusTractDetails : true
        });
    }

    hideCensusTractDetails(){
        this.setState({
            showCensusTractDetails : false
        });
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
                            const formattedTransitType = value.type.charAt(0).toUpperCase() + value.type.slice(1);
                            const popupContent = `
                                <Popup>
                                    <h6 class="text-center">${formattedTransitType}</p>
                                    <h4 class="text-center">${value.name}</h4>
                                </Popup>`;
                            layer.bindPopup(popupContent);
                            layer.on({
                                click: () => {
                                    let serviceLine = multiLineString((feature as any).geometry.coordinates);
                                    const intersectingTracts = [] as CensusTract[];
                                    this.state.censusTractData.features.forEach((tract : any) => {
                                        try{
                                            let thisCensusTract = polygon((tract as any).geometry.coordinates);
                                            const intersectionValue = lineIntersect(serviceLine, thisCensusTract as any);
                                            if(intersectionValue.features.length > 0){
                                                intersectingTracts.push({
                                                    feature: tract,
                                                    name: tract.properties.NAMELSAD10
                                                } as CensusTract);
                                            }
                                        } catch(ex){
                                            console.log(tract);
                                        }
                                    });
                                    this.state.suburbsTractData.features.forEach((tract : any) => {
                                        try{
                                            let thisCensusTract = polygon((tract as any).geometry.coordinates);
                                            const intersectionValue = lineIntersect(serviceLine, thisCensusTract as any);
                                            if(intersectionValue.features.length > 0){
                                                intersectingTracts.push({
                                                    feature: tract,
                                                    name: tract.properties.NAMELSAD10
                                                } as CensusTract);
                                            }
                                        } catch(ex){
                                            console.log(tract);
                                        }
                                    })
                                    value.intersectingTracts = intersectingTracts;
                                    this.setState({showLineDetails : true, selectedServiceLine : value});
                                }
                            })
                        }}
                    />
                displayedRoutes.push(transitLineOverlay);
            }
        }
        let censusTractOverlay : any;
        if(this.state.censusTractData){
            censusTractOverlay =
                <GeoJSON data={this.state.censusTractData}
                         style={this.tractHeatStyle}
                         onEachFeature={this.onEachCensusFeature}
                />
        }
        let suburbsOverlay : any;
        if(this.state.suburbsTractData){
            suburbsOverlay =
                <GeoJSON data={this.state.suburbsTractData}
                         style={this.suburbTractHeatStyle}
                         onEachFeature={this.onEachCensusFeature}
                         />
        }
        return (
            <Container fluid>
                <Row className="mt-sm-4">
                    <Col sm={9}>
                        <LeafletMap center={position} zoom = {mapDefault.zoom} style={{height: "80vh"}}>
                            <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMaps</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            <GeoJSON data={limitData as any} style={this.limitGeoJSONStyle} onEachFeature={this.onLimitFeature}/>
                            { this.state.displayRegion && <GeoJSON data={regionData as any} style={this.regionGeoJSONStyle} onEachFeature={this.onEachRegionFeature} /> }
                            { this.state.censusTractData && censusTractOverlay }
                            { this.state.suburbsTractData && suburbsOverlay }
                            { this.state.displayTransit && displayedRoutes }
                        </LeafletMap>
                    </Col>
                    <Col sm={3}>
                        <MapControls onDisplayChange={this.toggleDisplayState} onRouteOverlayChange={this.handleRouteOverlayUpdate} displayedRoutes={this.state.displayedRoutes}/>
                    </Col>
                </Row>
                <Row className="mt-sm-4">
                    <p>Note: Heat map represents the risk for census tract to have its residents convert to telework. The "hotter" (or more red) a census tract is, the more likely its residents are to telework.</p>
                </Row>
                { this.state.showCensusTractDetails && <CensusTractDetailModal show={this.state.showCensusTractDetails} onClose={() => { this.setState({showCensusTractDetails : false})} } censusTract={this.state.selectedCensusTract}/> }
                { this.state.showLineDetails && <TransitLineDetailModal show={this.state.showLineDetails} onClose={() => {this.setState({showLineDetails : false})}} transitLine={this.state.selectedServiceLine} /> }
            </Container>
        );
    }
}