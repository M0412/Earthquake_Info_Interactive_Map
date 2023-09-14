// Store our API endpoint as queryUrl and tectonicplatesUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicplatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Get the GeoJSON data
d3.json(queryUrl).then(function (data) {

  // Console log the data 
  console.log(data);

  // Call the createFeatures function
  createFeatures(data.features);

});

// Define a markerSize function that will give each earthquake a different radius based on its magnitude
function markerSize(magnitude) {
    return Math.sqrt(magnitude) * 10;
};

// Define a chooseColor function that will give each earthquake a different color based on its depth
function chooseColor(depth){
  if (depth < 10) return "greenyellow";
  else if (depth < 30) return "yellowgreen";
  else if (depth < 50) return "yellow";
  else if (depth < 70) return "orange";
  else if (depth < 90) return "orangered";
  else return "red";
}

// Create a createFeatures function
function createFeatures(earthquakeData) {
    
    // This is called on each feature, giving each feature a popup with information on each earthquake
    function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
    
    // Create a createCircleMarker function 
    function createCircleMarker(feature,latlng){
        var markers = {
            radius: feature.properties.mag * 20000,
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.7,
            color: "black",
            weight: 0.5
        }
        return L.circle(latlng,markers);
    };

    // Creating a GeoJSON layer with the retrieved data 
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
};

// Create a createMap function
function createMap(earthquakes) {
    
    // Create tile layers
    var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/satellite-v9',
    });
  
    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/light-v11',
    });

    var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/outdoors-v12',
    });

    // Create layer for tectonic plates
    tectonicPlates = new L.layerGroup();

    // // Get the GeoJSON data
    d3.json(tectonicplatesUrl).then(function (plates) {

        // Console log the data 
        console.log(plates);
        L.geoJSON(plates, {
            color: "orange",
            weight: 2
        }).addTo(tectonicPlates);
    });

    // Create a baseMaps object.
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    // Create an overlay object to use in our layer control
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };
    
    // Create our map, giving it the satellite, earthquakes, and tectonicPlates layers to display on load.
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [satellite, earthquakes, tectonicPlates]
    });

    // Add legend
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
        depth = [-10, 10, 30, 50, 70, 90];
        
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
        
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
            '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(myMap)

   // Create a layer control.
   L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
   }).addTo(myMap);
};



