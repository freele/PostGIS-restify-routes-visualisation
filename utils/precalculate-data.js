var    pg         = require('pg-query');
var    path       = require('path');
var fs = require('fs');

var mallsData = {
  europeyskiy: {
    filename: 'europeyskiy.json',
    coords: [37.565712, 55.744938],
    radius: 1000
  },
  zolotoy_vavilon: {
    filename: 'zolotoy_vavilon.json',
    coords: [37.661292, 55.845645],
    radius: 1000
  },
  sadovod: {
    filename: 'sadovod.json',
    coords: [37.830043, 55.654760],
    radius: 1000
  },
  schuka: {
    filename: 'schuka.json',
    coords: [37.464650, 55.809457],
    radius: 1000
  }
}

var currentMall = mallsData.schuka;


pg.connectionParameters = 'postgres://docker:docker@192.168.99.100:25432/gis'; // _TODO move to config file
console.log(pg.connectionParameters);

var error_response = "data already exists - bypassing db initialization step\n";

function select_all(req, res, next){
  console.log('SELECT ALL');
  pg(" \
SELECT row_to_json(fc) \
FROM \
  (SELECT 'FeatureCollection' AS TYPE, \
          array_to_json(array_agg(f)) AS features \
   FROM \
     (SELECT 'Feature' AS TYPE, \
             ST_AsGeoJSON(lg.wkb_geometry)::json AS geometry, \
             row_to_json( \
                           (SELECT l \
                            FROM \
                              (SELECT time) AS l)) AS properties \
      FROM ogrgeojson AS lg, \
           malls \
      WHERE ST_Crosses(ST_Buffer(ST_MakePoint(" + currentMall.coords[0] + ", " + currentMall.coords[1] + ")::geography, 1000)::geometry, lg.wkb_geometry) ) AS f) AS fc \
      ",
      function(err, rows, result) {
    console.log('ERR', err);
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }

    console.log('features count', result.rows[0].row_to_json.features.length);

    var response = {};
      response.routes = result.rows[0].row_to_json.features.map(function(feature) {
      // return {
      //   time: feature.properties.time,
      //   start: feature.geometry.coordinates[0],
      //   end: feature.geometry.coordinates[feature.geometry.coordinates.length - 1],
      // };
      var d = new Date(feature.properties.time);
      var time = d.getTime();
      if (time){
        return [
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[feature.geometry.coordinates.length - 1],
          time,
        ];
      } else {
        return undefined;
      }
    }).filter(function(n){ return !!n; });

    response.mall = currentMall;

    console.log('in response:', response.length);

    fs.writeFile('calculated/' + currentMall.filename, JSON.stringify(response, null, 4), function(err) {
      if (err) throw err;
      console.log('It\'s saved!');
      process.exit(0);
    });
  });
};

select_all();

