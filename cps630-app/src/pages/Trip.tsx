import {APIProvider, Map} from '@vis.gl/react-google-maps';
import Directions from '../utils/Directions';
import { DestinationProp } from './Payment';


function Trip({destination, setDistance, setOrigin}: DestinationProp) {
    const position = {lat: 43.6532, lng: -79.3832}; // dt toronto coords
    return (
        <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
        <div style={{height: "50vh"}}>
            <Map defaultCenter={position} defaultZoom={10} mapId={import.meta.env.VITE_MAP_ID}>
                <Directions 
                    destination={destination}
                    setDistance={setDistance}
                    setOrigin={setOrigin}
                />
            </Map>
        </div>
        </APIProvider>
    );
}

export default Trip;