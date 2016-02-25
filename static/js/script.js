angular.module('MyApp',['ngMaterial', 'ngMessages', 'material.svgAssetsCache'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey') // specify primary color, all
                            // other color intentions will be inherited
                            // from default
})
.controller('AppCtrl', function($scope) {
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
    // map.removeLayer(markerLayerGroup);

    //add the new pins
    var routes = response.routes;
    var mall = response.mall;

    var markerArrayHomes = new Array(routes.length)
    var markerArray2 = new Array(routes.length)
    for (var i = 0; i < routes.length; i++){
      var placeFrom = routes[i];
      // markerArray[i] = L.marker([placeFrom[0][0], placeFrom[0][1]]).bindPopup(park.name);
      // markerArray[i] = L.marker([placeFrom[0][1], placeFrom[0][0]]);

      var d = new Date(placeFrom[2]);
      var hours = d.getHours();

      var startIndex = hours < 12 ? 0 : 1; // First part of the day - starting point, second - end point.
      markerArrayHomes[i] = L.circle([placeFrom[startIndex][1], placeFrom[startIndex][0]], 50, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.3
      });
      // markerArray2[i] = L.circle([placeFrom[1][1], placeFrom[1][0]], 50, {
      //     color: 'green',
      //     fillColor: '#f03',
      //     fillOpacity: 0.3
      // });
    }

    var mall = L.circle([mall.coords[1], mall.coords[0]], mall.radius, {
        fillColor: 'blue',
        fillOpacity: 0.3
    });

    var layerGroup1 = L.layerGroup(markerArrayHomes).addTo(map);
    // var layerGroup2 = L.layerGroup(markerArray2).addTo(map);
    // L.layerGroup(mall).addTo(map);
    map.addLayer(mall);

    // map.removeLayer(layerGroup2);
    // map.addLayer(layerGroup2);
    // markerLayerGroup = L.layerGroup(markerArray).addTo(map);
  }

  map.whenReady(getRoutes)

});