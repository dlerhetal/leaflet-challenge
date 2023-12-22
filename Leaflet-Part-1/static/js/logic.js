let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
d3.json(url).then((data) => {
  createFeatures(data.features);
  console.log(JSON.stringify(data));
});

function createFeatures(earthquakeData) {
  let earthquakeLayer = L.layerGroup(); // Create a layer group for the earthquake markers

  function onEachFeature(feature, layer) {
    var depth = feature.geometry.coordinates[2]; // Get the depth value from the GeoJSON feature
    var circleMarker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      radius: feature.properties.mag * 5, // Set the radius based on the magnitude
      fillColor: chooseColor(depth), // Get the color based on the depth
      color: chooseColor(depth), // Set the border color based on the depth
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
    circleMarker.bindPopup("Location: " + feature.properties.place + "Date/Time: " + Date(feature.properties.time) + "<br>Magnitude: " + feature.properties.mag + "<br>Depth: " + depth);
    circleMarker.addTo(earthquakeLayer); // Add the circle marker to the earthquake layer
  }

  L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  createMap(earthquakeLayer); // Pass the earthquake layer to the createMap function
}

function chooseColor(depth) {
  if (depth < 10) return "#99ff99";
  else if (depth < 30) return "#ccff99";
  else if (depth < 50) return "#ffff99";
  else if (depth < 70) return "#ffcc66";
  else if (depth < 90) return "#ff9933";
  else return "#ff3300";
}

function createMap(earthquakeLayer) {
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  let overlayMaps = {
    Earthquakes: earthquakeLayer // Pass the earthquake layer instead of earthquakeData
  };

  let myMap = L.map("map", {
    center: [44.967243, -103.771556],
    zoom: 4,
    layers: [street, earthquakeLayer] // Pass the earthquake layer instead of earthquakeData
  });

  L.control.layers(baseMaps, overlayMaps).addTo(myMap);

  // Create a legend control
  let legend = L.control({ position: "bottomright" });

  // Define the legend content
  legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [10, 30, 50, 70, 90];
    let labels = [];

    // Loop through the depths and create a label for each range
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML += '<i style="background:' + chooseColor(depths[i]) + '"></i> ' + depths[i] + (depths[i + 1] ? "&ndash;" + (depths[i + 1] - 1) + "<br>" : "+");
    }

  // Add CSS styles to the legend div
  div.style.backgroundColor = "white";
  div.style.padding = "10px";
  div.style.borderRadius = "5px";
  div.style.opacity = "0.8";

  // Add CSS styles to the color swatches
  let colorSwatches = div.getElementsByTagName("i");
  for (let j = 0; j < colorSwatches.length; j++) {
    colorSwatches[j].style.width = "20px";
    colorSwatches[j].style.height = "20px";
    colorSwatches[j].style.display = "inline-block";
    colorSwatches[j].style.marginRight = "5px";
  }

    return div;
  };

  // Add the legend to the map
  legend.addTo(myMap);
}