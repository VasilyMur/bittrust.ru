import axios from 'axios';

// Map Options
const mapOptions = {
  center: {lat: 55.7, lng: 37.6},
  zoom: 12
}

// Load Companies
function loadPlaces(map, lat = 55.7, lng = 37.6) {
  axios.get(`/api/companies/near?lat=${lat}&lng=${lng}`).then(res => {
    const places = res.data;
    if (!places.length) {
      alert('Места на карте на найдены!');
      return;
    }

    // Create Bounds
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    const markers = places.map(place => {
      // Destructuring - first assign placeLng - in MongoDB LNG is first!!
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };

      // Bind Each Marker into Bounds
      bounds.extend(position);
      const marker = new google.maps.Marker({
        map: map,
        position: position
      });

      marker.place = place;
      return marker;
    });

  // when someone click a marker -> show details of that place. Use addListener (google's addEventListener)
  markers.forEach(marker => {
    marker.addListener('click', function() {

      const html = `
      <div class="popup">
        <a href="/companies/${this.place.slug}">
          <img src="/uploads/${this.place.photo || 'company.jpg'}" alt="${this.place.name}" />
          <p>${this.place.name} - ${this.place.location.address}</p>
        </a>
      </div>
      `;
      infoWindow.setContent(html);
      infoWindow.open(map, this);
    })
  })



    // Then zoom the map to fit all the markers perfectly
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
  }).catch((err) => {
    console.log(err);
  });
};

// Make Map
function makeMap(mapDiv) {
  if(!mapDiv) return;

  // 1) Load Map
  const map = new google.maps.Map(mapDiv, mapOptions);
  // 2) Load places
  loadPlaces(map);

  // Setup Input AutoComplete
  const input = document.querySelector('input[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
  });

};




export default makeMap;
