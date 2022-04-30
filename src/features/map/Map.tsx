import { useNavigate } from 'react-router-dom';
import styles from './Map.module.scss';

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectForm, clearStatus } from '../form/formSlice';

import H from '@here/maps-api-for-javascript';

import { calculateTotal } from './calculateTotal';

import Pdf from 'react-to-pdf';
const MyPdf: any = Pdf;

export default function Map() {
  const navigate = useNavigate();
  const formState = useAppSelector(selectForm);
  const dispatch = useAppDispatch();

  const [kmCost, setKmCost] = useState(1.0);
  const [totalCost, setTotalCost] = useState(0);
  const [showChangeCost, setShowChangeCost] = useState(false);

  //mapRef for rendering Map, pdfRef for select pdf area
  const mapRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formState.status === 'finished') {
      //map rendering
      const platform = new H.service.Platform({
        apikey: process.env.REACT_APP_API
      });
      const layers = platform.createDefaultLayers();
      const map = new H.Map(mapRef.current!, layers.vector.normal.map, {
        pixelRatio: window.devicePixelRatio,
        padding: { top: 50, left: 50, bottom: 50, right: 50 }
      });

      //adding route polyline
      let routingParameters = {
        routingMode: 'fast',
        transportMode: 'car',
        origin: `${formState.origin.lat},${formState.origin.lng}`,
        destination: `${formState.destination.lat},${formState.destination.lng}`,
        return: 'polyline'
      };

      const onResult = function (result: any) {
        // ensure that at least one route was found
        if (result.routes.length) {
          result.routes[0].sections.forEach((section: any) => {
            // Create a linestring to use as a point source for the route line
            let linestring = H.geo.LineString.fromFlexiblePolyline(
              section.polyline
            );

            // Create a polyline to display the route:
            let routeLine = new H.map.Polyline(linestring, {
              style: { strokeColor: 'blue', lineWidth: 3 }
            });

            // Create a marker for the start point:
            let startMarker = new H.map.Marker(
              section.departure.place.location
            );

            // Create a marker for the end point:
            let endMarker = new H.map.Marker(section.arrival.place.location);

            // Add the route polyline and the two markers to the map:
            map.addObjects([routeLine, startMarker, endMarker]);

            // Set the map's viewport to make the whole route visible:
            map
              .getViewModel()
              .setLookAtData({ bounds: routeLine.getBoundingBox() });
          });
        }
      };
      const router = platform.getRoutingService(null, 8);

      router.calculateRoute(routingParameters, onResult, function (error) {
        alert(error.message);
      });
      dispatch(clearStatus());
    }
  }, [formState, dispatch]);

  //calculate total cost when kmCost changed or formState changed
  useEffect(() => {
    setTotalCost(calculateTotal(kmCost, formState.routeLength));
  }, [kmCost, formState]);

  const kmCostHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKmCost(+e.target.value);
  };

  const backHandler = () => {
    navigate('/');
  };

  const showHandler = () => {
    setShowChangeCost(state => !state);
  };

  return (
    <div className={styles.Map}>
      <div ref={mapRef} style={{ width: '500px', height: '500px' }}></div>
      <div ref={pdfRef}>
        <div className={styles.TripData}>
          <div className={styles.Costs}>
            <h1>{formState.history[0].origin.toUpperCase()}</h1>
            <h1>{'->'}</h1>
            <h1>{formState.history[0].destination.toUpperCase()}</h1>

            <h2>Total Cost: ${totalCost}</h2>
            <h4>
              Trip length: {Math.ceil(formState.routeLength / 800)} day(s)
            </h4>
            <h4>Distance: {formState.routeLength}km</h4>
            <h4>Cost per km: ${kmCost}</h4>
          </div>
        </div>
      </div>
      {!showChangeCost ? (
        <button onClick={showHandler}>Change Cost per km</button>
      ) : (
        <div className={styles.Change}>
          <input
            name="kmCost"
            type="number"
            min="0"
            step="0.01"
            onChange={kmCostHandler}
            value={kmCost}
          />
        </div>
      )}
      <button onClick={backHandler}>Go Back</button>

      <MyPdf
        targetRef={pdfRef}
        filename="trip.pdf"
        options={{}}
        x={44}
        y={25}
        scale={1}
      >
        {({ toPdf }: { toPdf: any }) => (
          <button onClick={toPdf}>Generate pdf</button>
        )}
      </MyPdf>
    </div>
  );
}
