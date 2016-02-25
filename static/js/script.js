
var map = L.map('map').setView([55.7500, 37.6167], 10);
var markerLayerGroup = L.layerGroup().addTo(map);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'freele.p805ih09',
    accessToken: 'pk.eyJ1IjoiZnJlZWxlIiwiYSI6ImNpa3pkbnlrMDAwNXd3N20wcm1wa3k1eW0ifQ.BahVJ6iQcwaC1GTQOq8jbw'
}).addTo(map);

function getRoutes(e){
  bounds = map.getBounds();
  url = "routes";
  $.get(url, pinTheMap, "json")
}

function pinTheMap(response){
  //clear the current pins
  map.removeLayer(markerLayerGroup);

  //add the new pins
  var routes = response.routes;
  var mall = response.mall;

  var markerArray1 = new Array(routes.length)
  var markerArray2 = new Array(routes.length)
  for (var i = 0; i < routes.length; i++){
    var placeFrom = routes[i];
    // markerArray[i] = L.marker([placeFrom[0][0], placeFrom[0][1]]).bindPopup(park.name);
    // markerArray[i] = L.marker([placeFrom[0][1], placeFrom[0][0]]);

    markerArray1[i] = L.circle([placeFrom[0][1], placeFrom[0][0]], 50, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3
    });
    markerArray2[i] = L.circle([placeFrom[1][1], placeFrom[1][0]], 50, {
        color: 'green',
        fillColor: '#f03',
        fillOpacity: 0.3
    });
  }

  var mall = L.circle([mall.coords[1], mall.coords[0]], mall.radius, {
      fillColor: 'blue',
      fillOpacity: 0.3
  });

  L.layerGroup(markerArray1).addTo(map);
  L.layerGroup(markerArray2).addTo(map);
  L.layerGroup(map).addTo(map);

  // markerLayerGroup = L.layerGroup(markerArray).addTo(map);
}

map.whenReady(getRoutes)