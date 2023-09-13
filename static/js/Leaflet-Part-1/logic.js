// Store the url in a variable
var URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get the GeoJSON data
d3.json(URL).then(function(data){

    // Console log the data 
    console.log(data);

    // Call the createFeatures function
    createFeatures(data.features);
});

// Define a markerSize() function that will give each earthquake a different radius based on its magnitude.
function markerSize(magnitude) {
  return Math.sqrt(magnitude) * 5;
};
