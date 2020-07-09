import {TransitStop} from "../types/TransitStop";

export class ExternalDataManager {
    async getRouteStops(routeName : string) : Promise<TransitStop[]> {
        const apiUrl : string = "";
        const routeStopsAPIResponse = await this.makeRequest(apiUrl);
        const stopResponseArray = routeStopsAPIResponse.bus;
        const stopArray : TransitStop[] = [];
        stopResponseArray.forEach((stop : any) => {
            const thisStop : TransitStop = {
                route: routeName,
                lat: stop.lat,
                lng: stop.lng,
                name: stop.destination,
                direction: stop.direction
            };
            stopArray.push(thisStop);
        });
        return stopArray;
    }

    private async makeRequest(reqUrl : string) : Promise<any> {
        return new Promise(function(resolve, reject) {
            let req = new XMLHttpRequest();
            req.open('POST', reqUrl);
            req.onload = () => {
                if(req.status >= 200 && req.status < 300){
                    resolve(JSON.parse(req.response));
                } else {
                    reject(req.statusText);
                }
            };
            req.onerror = () => reject(req.statusText);
            req.send();
        });
    }
}