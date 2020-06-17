import * as React from 'react';
import {Map, GeoJSON, TileLayer} from 'react-leaflet';
import * as regionData from '../../assets/pointe-prototype.json';
import {Feature} from "geojson";
import {Layer} from "leaflet";

export interface TeleworkMapProps {}

export class TeleworkMap extends React.Component<TeleworkMapProps, {}> {
    state = {
        lat : 40.811349,
        lng : -77.890154,
        zoom : 20
    }

    geoJSONStyle(feature : Feature) {
        let fillColor;
        if(feature.properties.magnitude > 0){
            fillColor = '#00ff00';
        } else if(feature.properties.magnitude < 0) {
            fillColor = '#f6f6f6';
        } else {
            fillColor = '#ff0000';
        }
        return {
            color: '#1f2021',
            weight: 1,
            fillOpacity: 0.5,
            fillColor: fillColor
        }
    }

    onEachFeature(feature : Feature, layer : Layer) {
        const popupContent = ` <Popup><p>${feature.properties.magnitude} entities per region</pre></Popup>`;
        layer.bindPopup(popupContent);
    }

    render() {
        const position = {lat: this.state.lat, lng: this.state.lng};
        return (
            <Map center={position} zoom = {this.state.zoom}>
                <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMaps</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <GeoJSON data={regionData as any} style={this.geoJSONStyle} onEachFeature={this.onEachFeature} />
            </Map>
        );
    }
}