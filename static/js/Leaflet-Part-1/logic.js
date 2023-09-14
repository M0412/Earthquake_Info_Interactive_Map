// Store the url in a variable
var URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get the GeoJSON data
d3.json(URL).then(function(data){

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
};

// Create a createFeatures function
function createFeatures(earthquakeData) {

    // This is called on each feature, giving each feature a popup with information on each earthquake
    function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    };

    // Create a createCircleMarker function 
    function createCircleMarker(feature,latlng){
        let markers = {
            radius:markerSize(feature.properties.mag),
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            color: "black",
            stroke: true,
            weight: 1,
            opacity: .8,
            fillOpacity: 0.35
        }
        return L.circleMarker(latlng, markers);
    };
    
    // Creating a GeoJSON layer with the retrieved data 
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });
      
    // Send earthquakes layer to the createMap function
    createMap(earthquakes);
};

// Create a createMap function
function createMap(earthquakes) {

    // Add a tile layer
    let grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create our map, giving it the grayscale and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [grayscale, earthquakes]
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
};