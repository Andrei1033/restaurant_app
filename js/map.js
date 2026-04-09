let map;
let userLocation = null;

const defaultLocation = [60.1699, 24.9384]; // Helsinki

/* testiravintolat — poistetaan kun API kytketään */
const testRestaurants = [
  {
    name: "Ravintola Töölö",
    address: "Töölönkatu 12, Helsinki",
    location: { coordinates: [24.9234, 60.1756] }
  },
  {
    name: "Ravintola Otaniemi",
    address: "Otakaari 4, Espoo",
    location: { coordinates: [24.8301, 60.1841] }
  },
  {
    name: "Ravintola Pasila",
    address: "Pasilanraitio 5, Helsinki",
    location: { coordinates: [24.9322, 60.1987] }
  },
  {
    name: "Ravintola Kallio",
    address: "Fleminginkatu 8, Helsinki",
    location: { coordinates: [24.9501, 60.1834] }
  }
];

/* laske etäisyys kahden koordinaatin välillä */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

/* löydä lähin ravintola */
const findClosest = (restaurants, userLat, userLon) => {
  let closestIndex = 0;
  let closestDistance = Infinity;

  restaurants.forEach((restaurant, index) => {
    const [lon, lat] = restaurant.location.coordinates;
    const distance = getDistance(userLat, userLon, lat, lon);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

/* tee marker ikonit */
const normalIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 14px;
    height: 14px;
    background: rgba(4, 53, 88);
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const closestIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 18px;
    height: 18px;
    background: #e24b4a;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(226,75,74,0.5);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

/* lisää ravintolat kartalle */
const addRestaurantsToMap = (restaurants, closestIndex) => {
  restaurants.forEach((restaurant, index) => {
    const [lon, lat] = restaurant.location.coordinates;
    const isClosest = index === closestIndex;
    const icon = isClosest ? closestIcon : normalIcon;

    const marker = L.marker([lat, lon], { icon }).addTo(map);

    /* popup sisältö */
    const popupContent = `
      <div style="
        font-family: 'Open Sans', sans-serif;
        min-width: 200px;
        padding: 4px;
      ">
        <p style="
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: rgba(4, 53, 88);
          margin: 0 0 4px 0;
        ">${restaurant.name}</p>

        ${isClosest ? `<span style="
          font-size: 11px;
          font-weight: 600;
          color: rgba(4, 53, 88);
          background: rgba(4, 53, 88, 0.08);
          padding: 2px 8px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 6px;
        ">Lähin</span>` : ''}

        <p style="
          font-size: 12px;
          color: #888;
          margin: 0 0 12px 0;
        ">${restaurant.address}</p>

        <div style="display: flex; gap: 6px;">
          <button onclick="openMenuModal('${restaurant.name}', ${isClosest}, false, testDailyData, testWeeklyData)" style="
            flex: 1;
            padding: 7px;
            background: rgba(4, 53, 88);
            color: #fff;
            border: none;
            border-radius: 6px;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">Näytä menu</button>

          <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" style="
            flex: 1;
            padding: 7px;
            background: transparent;
            color: rgba(4, 53, 88);
            border: 1px solid rgba(4, 53, 88);
            border-radius: 6px;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-decoration: none;
            text-align: center;
          ">Google Maps</a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 260,
      closeButton: false
    });
  });
};

/* alusta kartta */
const initMap = () => {
  map = L.map('map').setView(defaultLocation, 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    noWrap: true,
    attribution: '&copy; OpenStreetMap',
    maxBoundsViscosity: 1.0,
    bounds: [[-90, -180], [90, 180]]
  }).addTo(map);

  /* pyydä käyttäjän sijainti */
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        userLocation = [latitude, longitude];

        /* siirrä kartta käyttäjän sijaintiin */
        map.setView(userLocation, 10);

        /* lisää käyttäjän sijainti merkki */
        L.circleMarker(userLocation, {
          radius: 8,
          fillColor: '#3b8beb',
          color: '#fff',
          weight: 2,
          fillOpacity: 1
        }).addTo(map).bindPopup('Olet tässä');

        /* löydä lähin ja lisää ravintolat */
        const closestIndex = findClosest(testRestaurants, latitude, longitude);
        addRestaurantsToMap(testRestaurants, closestIndex);
      },
      /* jos käyttäjä kieltää sijainnin */
      () => {
        addRestaurantsToMap(testRestaurants, 0);
      }
    );
  } else {
    addRestaurantsToMap(testRestaurants, 0);
  }
};

