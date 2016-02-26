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


  // (It's CSV, but GitHub Pages only gzip's JSON at the moment.)

  // Various formatters.
  var formatNumber = d3.format(",d"),
      formatChange = d3.format("+,d"),
      formatDate = d3.time.format("%B %d, %Y"),
      formatTime = d3.time.format("%I:%M %p");

  // A nest operator, for grouping the flight list.
  var nestByDate = d3.nest()
      .key(function(d) { return d3.time.day(d.date); });

  function pinTheMap(response){
    //clear the current pins
    // map.removeLayer(markerLayerGroup);

    //add the new pins
    var routes = response.routes;

    // A little coercion, since the CSV is untyped.
    var flights = routes.map(function(d, i) {
      return {
        index: i,
        start: d[0],
        end: d[1],
        date: new Date(d[2]),
      }
    });

    // Create the crossfilter for the relevant dimensions and groups.
    var flight = crossfilter(flights),
        all = flight.groupAll(),
        date = flight.dimension(function(d) { return d.date; }),
        dates = date.group(d3.time.day),
        hour = flight.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
        hours = hour.group(Math.floor);

    var charts = [

      barChart()
          .dimension(hour)
          .group(hours)
        .x(d3.scale.linear()
          .domain([0, 24])
          .rangeRound([0, 10 * 24])),

    ];

    // Given our array of charts, which we assume are in the same order as the
    // .chart elements in the DOM, bind the charts to the DOM and render them.
    // We also listen to the chart's brush events to update the display.
    var chart = d3.selectAll(".chart")
        .data(charts)
        .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

    // Render the initial lists.
    var list = d3.selectAll(".list")
        .data([flightList.bind(this)]);

    // Render the total.
    d3.selectAll("#total")
        .text(formatNumber(flight.size()));

    renderAll();

    // Renders the specified chart or list.
    function render(method) {
      d3.select(this).call(method);
    }

    // Whenever the brush moves, re-rendering everything.
    function renderAll() {
      chart.each(render);
      list.each(render);
      d3.select("#active").text(formatNumber(all.value()));
    }

    window.filter = function(filters) {
      filters.forEach(function(d, i) { charts[i].filter(d); });
      renderAll();
    };

    window.reset = function(i) {
      charts[i].filter(null);
      renderAll();
    };


    var mall = response.mall;
    var mall = L.circle([mall.coords[1], mall.coords[0]], mall.radius, {
        fillColor: 'blue',
        fillOpacity: 0.3
    });
    map.addLayer(mall);

    var layerHomes;
    function flightList(div) {
      if (layerHomes) {
        map.removeLayer(layerHomes);
      }


      var flightsByDate = nestByDate.entries(date.top(1000));

      var markerArrayHomes = new Array(flightsByDate.length)
      // var markerArray2 = new Array(routes.length)
      for (var i = 0; i < flightsByDate.length; i++){
        var placeFrom = flightsByDate[i].values[0];
        // markerArray[i] = L.marker([placeFrom[0][0], placeFrom[0][1]]).bindPopup(park.name);
        // markerArray[i] = L.marker([placeFrom[0][1], placeFrom[0][0]]);

        var d = new Date(placeFrom.date);
        var hours = d.getHours();

        var startIndex = hours < 12 ? 'start' : 'end'; // First part of the day - starting point, second - end point.
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


      layerHomes = L.layerGroup(markerArrayHomes).addTo(map);
      // var layerGroup2 = L.layerGroup(markerArray2).addTo(map);
      // L.layerGroup(mall).addTo(map);


      // map.removeLayer(layerGroup2);
      // map.addLayer(layerGroup2);
      // markerLayerGroup = L.layerGroup(markerArray).addTo(map);
      //

      // div.each(function() {
      //   var date = d3.select(this).selectAll(".date")
      //       .data(flightsByDate, function(d) { return d.key; });
      //
      //   date.enter().append("div")
      //       .attr("class", "date")
      //     .append("div")
      //       .attr("class", "day")
      //       .text(function(d) { return formatDate(d.values[0].date); });
      //
      //   date.exit().remove();
      //
      //   var flight = date.order().selectAll(".flight")
      //       .data(function(d) { return d.values; }, function(d) { return d.index; });
      //
      //   var flightEnter = flight.enter().append("div")
      //       .attr("class", "flight");
      //
      //   flightEnter.append("div")
      //       .attr("class", "time")
      //       .text(function(d) { return formatTime(d.date); });
      //
      //   flight.exit().remove();
      //
      //   flight.order();
      // });
    }

    function barChart() {
      if (!barChart.id) barChart.id = 0;

      var margin = {top: 10, right: 10, bottom: 20, left: 10},
          x,
          y = d3.scale.linear().range([100, 0]),
          id = barChart.id++,
          axis = d3.svg.axis().orient("bottom"),
          brush = d3.svg.brush(),
          brushDirty,
          dimension,
          group,
          round;

      function chart(div) {
        var width = x.range()[1],
            height = y.range()[0];

        y.domain([0, group.top(1)[0].value]);

        div.each(function() {
          var div = d3.select(this),
              g = div.select("g");

          // Create the skeletal chart.
          if (g.empty()) {
            div.select(".title").append("a")
                .attr("href", "javascript:reset(" + id + ")")
                .attr("class", "reset")
                .text("reset")
                .style("display", "none");

            g = div.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.append("clipPath")
                .attr("id", "clip-" + id)
              .append("rect")
                .attr("width", width)
                .attr("height", height);

            g.selectAll(".bar")
                .data(["background", "foreground"])
              .enter().append("path")
                .attr("class", function(d) { return d + " bar"; })
                .datum(group.all());

            g.selectAll(".foreground.bar")
                .attr("clip-path", "url(#clip-" + id + ")");

            g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(axis);

            // Initialize the brush component with pretty resize handles.
            var gBrush = g.append("g").attr("class", "brush").call(brush);
            gBrush.selectAll("rect").attr("height", height);
            gBrush.selectAll(".resize").append("path").attr("d", resizePath);
          }

          // Only redraw the brush if set externally.
          if (brushDirty) {
            brushDirty = false;
            g.selectAll(".brush").call(brush);
            div.select(".title a").style("display", brush.empty() ? "none" : null);
            if (brush.empty()) {
              g.selectAll("#clip-" + id + " rect")
                  .attr("x", 0)
                  .attr("width", width);
            } else {
              var extent = brush.extent();
              g.selectAll("#clip-" + id + " rect")
                  .attr("x", x(extent[0]))
                  .attr("width", x(extent[1]) - x(extent[0]));
            }
          }

          g.selectAll(".bar").attr("d", barPath);
        });

        function barPath(groups) {
          var path = [],
              i = -1,
              n = groups.length,
              d;
          while (++i < n) {
            d = groups[i];
            path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
          }
          return path.join("");
        }

        function resizePath(d) {
          var e = +(d == "e"),
              x = e ? 1 : -1,
              y = height / 3;
          return "M" + (.5 * x) + "," + y
              + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
              + "V" + (2 * y - 6)
              + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
              + "Z"
              + "M" + (2.5 * x) + "," + (y + 8)
              + "V" + (2 * y - 8)
              + "M" + (4.5 * x) + "," + (y + 8)
              + "V" + (2 * y - 8);
        }
      }

      brush.on("brushstart.chart", function() {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", null);
      });

      // brush.on("brush.chart", function() {
      //   var g = d3.select(this.parentNode),
      //       extent = brush.extent();
      //   if (round) g.select(".brush")
      //       .call(brush.extent(extent = extent.map(round)))
      //     .selectAll(".resize")
      //       .style("display", null);
      //   g.select("#clip-" + id + " rect")
      //       .attr("x", x(extent[0]))
      //       .attr("width", x(extent[1]) - x(extent[0]));
      //   dimension.filterRange(extent);
      // });

      brush.on("brushend.chart", function() {
        var g = d3.select(this.parentNode),
            extent = brush.extent();
        if (round) g.select(".brush")
            .call(brush.extent(extent = extent.map(round)))
          .selectAll(".resize")
            .style("display", null);
        g.select("#clip-" + id + " rect")
            .attr("x", x(extent[0]))
            .attr("width", x(extent[1]) - x(extent[0]));
        dimension.filterRange(extent);

        if (brush.empty()) {
          var div = d3.select(this.parentNode.parentNode.parentNode);
          div.select(".title a").style("display", "none");
          div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
          dimension.filterAll();
        }
      });

      chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
      };

      chart.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        brush.x(x);
        return chart;
      };

      chart.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
      };

      chart.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
      };

      chart.filter = function(_) {
        if (_) {
          brush.extent(_);
          dimension.filterRange(_);
        } else {
          brush.clear();
          dimension.filterAll();
        }
        brushDirty = true;
        return chart;
      };

      chart.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return chart;
      };

      chart.round = function(_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
      };

      return d3.rebind(chart, brush, "on");
    }

  }

  map.whenReady(getRoutes)

});