var    pg         = require('pg-query');
var    path       = require('path');

pg.connectionParameters = 'postgres://docker:docker@192.168.99.100:25432/gis'; // _TODO move to config file
console.log(pg.connectionParameters);

var error_response = "data already exists - bypassing db initialization step\n";


// function select_box(req, res, next){
//   //clean these variables:
//   var query = req.query;
//   var limit = (typeof(query.limit) !== "undefined") ? query.limit : 40;
//   if(!(Number(query.lat1)
//     && Number(query.lon1)
//     && Number(query.lat2)
//     && Number(query.lon2)
//     && Number(limit)))
//   {
//     res.send(500, {http_status:400,error_msg: "this endpoint requires two pair of lat, long coordinates: lat1 lon1 lat2 lon2\na query 'limit' parameter can be optionally specified as well."});
//     return console.error('could not connect to postgres', err);
//   }
//   pg('SELECT gid,name,ST_X(the_geom) as lon,ST_Y(the_geom) as lat FROM ' + table_name+ ' t WHERE ST_Intersects( ST_MakeEnvelope('+query.lon1+", "+query.lat1+", "+query.lon2+", "+query.lat2+", 4326), t.the_geom) LIMIT "+limit+';', function(err, rows, result){
//     if(err) {
//       res.send(500, {http_status:500,error_msg: err})
//       return console.error('error running query', err);
//     }
//     res.send(rows);
//     return rows;
//   })
// };

function selectAll(req, res, next){
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
      WHERE ST_Crosses(ST_Buffer(ST_MakePoint(37.565712, 55.744938)::geography, 3000)::geometry, lg.wkb_geometry) limit 10) AS f) AS fc \
      ",
      function(err, rows, result) {
    console.log('ERR', err);
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    console.log(result.rows);
    var response = result.rows[0].row_to_json.features.map(function(feature) {
      // return {
      //   time: feature.properties.time,
      //   start: feature.geometry.coordinates[0],
      //   end: feature.geometry.coordinates[feature.geometry.coordinates.length - 1],
      // };
      return [
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[feature.geometry.coordinates.length - 1],
        feature.properties.time,
      ];
    });
    res.send(response);
    return rows;
  });
};

function selectAllPrecalculated(req, res, next){
  console.log('SELECT ALL PRECALCULATED');

  res.send(require('../utils/calculated/zolotoy_vavilon.json'));
};

module.exports = exports = {
  selectAll: selectAll,
  selectAllPrecalculated: selectAllPrecalculated,
  // selectBox: select_box,
  // flushDB:   flush_db,
  // initDB:    init_db
};
