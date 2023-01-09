// turf-distance.d.ts
declare module '@turf/distance' {
  import { Units, Coord } from '@turf/helpers';
  function distance(from: Coord, to: Coord, options: { units?: Units }): number;
  export default distance;
}
