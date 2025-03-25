import {AdvancedMarker, APIProvider, Map} from '@vis.gl/react-google-maps';

function Trip() {
  const position = {lat: 53.54992, lng: 10.00678};

  return (
    <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
      <div style={{height: "100vh"}}>
          <Map defaultCenter={position} defaultZoom={10} mapId="DEMO_MAP_ID">
            <AdvancedMarker position={position} />
          </Map>
      </div>
    </APIProvider>
  );
}

export default Trip;