import {TransitRoute} from "../components/MapView";

export interface CensusTract {
    name : string,
    feature : any,
    intersectingRoutes? : TransitRoute[]
}