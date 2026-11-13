import proj4 from 'proj4';

proj4.defs(
  '2913',
  '+proj=lcc +lat_1=46 +lat_2=44.33333333333334 +lat_0=43.66666666666666 +lon_0=-120.5 +x_0=2500000.0001424 +y_0=0 +ellps=GRS80 +to_meter=0.3048 +no_defs'
);
proj4.defs('102100', proj4.defs('EPSG:3857'));
proj4.defs('EPSG:102100', proj4.defs('EPSG:3857'));

export default proj4;
