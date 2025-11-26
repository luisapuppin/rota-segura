declare module 'leaflet.heat' {
  import * as L from 'leaflet';

  interface HeatLayerOptions {
    radius?: number;
    blur?: number;
    max?: number;
    gradient?: Record<number, string>;
  }

  function heatLayer(points: Array<[number, number, number]>, options?: HeatLayerOptions): L.Layer;

  export = heatLayer;
}

declare module 'leaflet' {
  // allow ambient any on heat plugin access if needed
  namespace heatLayer {}
}
