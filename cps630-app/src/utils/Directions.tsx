import { useMap, useMapsLibrary} from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { DestinationProp } from '../pages/Payment';

const startLocations = [
    'Toronto Metropolitan University, Victoria Street, Toronto, ON, Canada',
    'University of Toronto Mississauga, Mississauga Road, Missisauga, ON, Canada',
    'University of Toronto Scarborough, Military Trail, Scarborough, ON, Canada',
    'Bramalea Civic Centre, Central Park Drive, Brampton, ON, Canada',
]

function Directions({destination, setDistance, setOrigin}: DestinationProp) {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const [bestOrigin, setBestOrigin] = useState(startLocations[0]) // TMU will be defualt origin
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
    const [directionMatrix, setDirectionMatrix] = useState<google.maps.DistanceMatrixService>();

    // initialize necessary services
    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({map}));
        setDirectionMatrix(new routesLibrary.DistanceMatrixService())
    }, [routesLibrary, map]);
    
    // use distanceMatrix to get the origin address that will have the shortest route 
    // between origin and destination
    useEffect(() => {
        if (!directionMatrix) return;
        directionMatrix.getDistanceMatrix({
            origins: startLocations,
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        }).then(response => {
            const distances = response.rows.map(route => {
                if (route.elements[0]['status'] === "OK") return route.elements[0].distance.value
                else return 1_000_000_000; // in the case of no possible route, just return an impossibly large num
            })
            // get the minimum distance and its corresponding address and set it as the best origin
            const minDistance = Math.min(...distances)
            // in case of no valid routes, early return and set distance to -1 to signal an error
            if (minDistance === 1_000_000_000) {
                setDistance(-1);
                return;
            }
            setBestOrigin(startLocations[distances.indexOf(minDistance)])
            // set distance and origin of the trip
            setOrigin(bestOrigin); // yes this does the same as the line above but this is for Payment
            setDistance(minDistance);

        }).catch(() => {setDistance(-1);})
    }, [directionMatrix, destination])

    // find route using directions service and render it to the map
    useEffect(() => {
        if (!directionsService || !directionsRenderer) return;

        directionsService.route({
            origin: bestOrigin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
        }).then(response => {
            directionsRenderer.setDirections(response);
        }).catch(() => {setDistance(-1)})
    }, [directionsService, directionsRenderer, bestOrigin, destination]);

    return null
}
export default Directions;