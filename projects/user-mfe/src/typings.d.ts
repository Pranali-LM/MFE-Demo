// Import Leaflet into L in case you want to reference Leaflet types
import * as L from 'leaflet';
import 'leaflet-realtime';
// Declare the leaflet module so we can modify it
declare module 'leaflet' {
  function realtime(source, options);
}
