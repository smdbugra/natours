/*eslint-disable*/

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoib3pkZW1pcnNhbSIsImEiOiJjbDJjNjhvZWIwNTM4M2ptdnJwMGk4dnE3In0.Il9ysBATjm794HRe8HNNCw';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/ozdemirsam/cl2c9prgs00cq15pfhsgiuopv', // style URL
    scrollZoom: false
    // center: [-118.113491, 34.1111745], // starting position [lng, lat]
    // zoom: 7 // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
