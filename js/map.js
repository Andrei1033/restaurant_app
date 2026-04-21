let map;
let userLocation = null;
let locationPromise = null;

const defaultLocation = [60.1699, 24.9384]; // Helsinki

/* laske etäisyys kahden koordinaatin välillä */
const getDistance = (lat1, lon1, lat2, lon2) => {
   const R = 6371;
   const dLat = ((lat2 - lat1) * Math.PI) / 180;
   const dLon = ((lon2 - lon1) * Math.PI) / 180;
   const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* löydä lähin ravintola */
const findClosest = (restaurants, userLat, userLon) => {
   if (!Array.isArray(restaurants) || restaurants.length === 0) return -1;

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
   iconAnchor: [7, 7],
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
   iconAnchor: [9, 9],
});

/* lisää ravintolat kartalle */
const addRestaurantsToMap = (restaurants, closestIndex) => {
   restaurants.forEach((restaurant, index) => {
      const [lon, lat] = restaurant.location.coordinates;
      const isClosest = index === closestIndex;
      const icon = isClosest ? closestIcon : normalIcon;

      const marker = L.marker([lat, lon], {icon}).addTo(map);

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

        ${
           isClosest
              ? `<span style="
          font-size: 11px;
          font-weight: 600;
          color: rgba(4, 53, 88);
          background: rgba(4, 53, 88, 0.08);
          padding: 2px 8px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 6px;
        ">Lähin</span>`
              : ''
        }

        <p style="
          font-size: 12px;
          color: #888;
          margin: 0 0 12px 0;
        ">${restaurant.address}</p>

        <div style="display: flex; gap: 6px;">
          <button class="open-menu-btn" data-id="${restaurant._id}" style="
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
         closeButton: false,
      });

      /* attach async menu loader when popup opens */
      marker.on('popupopen', async (e) => {
         try {
            const popupEl = e.popup.getElement();
            if (!popupEl) return;
            const btn = popupEl.querySelector('.open-menu-btn');
            if (!btn) return;

            // Replace the button with a clean clone to remove any previously attached listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            // Use the fresh element for attaching event listeners
            const menuBtn = newBtn;

            /* tarkista onko menu saatavilla */
            const daily = await getDailyMenu(restaurant._id, window.currentLang || 'fi');
            const weekly = await getWeeklyMenu(restaurant._id, window.currentLang || 'fi');
            const hasMenu = (daily && daily.length > 0) || (weekly && weekly.length > 0);

            if (!hasMenu) {
               /* korvaa nappi varoituksella */
               btn.outerHTML = `
            <p style="
               font-size: 12px;
               color: #9a6700;
               background: #faeeda;
               border-radius: 6px;
               padding: 5px 10px;
               margin: 0;
               flex: 1;
               text-align: center;
            ">Menue ei löyty</p>
            `;
               return;
            }

            menuBtn.addEventListener('click', async () => {
               const id = menuBtn.dataset.id;
               const daily = await getDailyMenu(id, window.currentLang || 'fi');
               const weekly = await getWeeklyMenu(id, window.currentLang || 'fi');
               openMenuModal(restaurant.name, isClosest, false, daily, weekly, restaurant._id);
            });
         } catch (err) {
            console.error('Error attaching popup handlers', err);
         }
      });
   });
};

/* Create a promise that resolves when the location is obtained */
const getUserLocation = () => {
   return new Promise((resolve) => {
      if (userLocation) {
         resolve(userLocation);
         return;
      }
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
            (position) => {
               userLocation = [position.coords.latitude, position.coords.longitude];
               resolve(userLocation);

               // Move the map to the user's location
               map.setView(userLocation, 10);

               // Add user location marker
               L.circleMarker(userLocation, {
                  radius: 8,
                  fillColor: '#3b8beb',
                  color: '#fff',
                  weight: 2,
                  fillOpacity: 1,
               }).addTo(map);

               resolve(userLocation);
            },
            (error) => {
               // If the user denies or an error occurs, use the default location
               console.warn('Geolocation error:', error);
               userLocation = defaultLocation;
               resolve(userLocation);
            }
         );
      } else {
         // If the browser does not support geolocation
         userLocation = defaultLocation;
         resolve(userLocation);
      }
   });
};

/* alusta kartta */
const initMap = () => {
   map = L.map('map').setView(defaultLocation, 10);

   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      noWrap: true,
      attribution: '&copy; OpenStreetMap',
      maxBoundsViscosity: 1.0,
      bounds: [
         [-90, -180],
         [90, 180],
      ],
   }).addTo(map);
};
