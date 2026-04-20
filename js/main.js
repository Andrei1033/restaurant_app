window.renderCards = window.renderCards || function () {};
window.rendreCards = window.rendreCards || function () {};

let currentLang = 'fi';
let allRestaurants = [];
let closestIndex = 0;
let currentPage = 1;
const cardsPerPage = 8;

const init = async () => {
   // Odota että ui.js on ladattu
   if (typeof renderCards === 'undefined') {
      console.log('Odota renderCards...');
      setTimeout(init, 100);
      return;
   }

   initMap();
   initProfileModal();
   initFavouriteFilter();
   initMenuModalFavourite();

   // Lataa käyttäjän suosikki
   await loadUserFavourite();

   /* tarkista onko käyttäjä jo kirjautunut */
   const user = await checkToken();
   if (user) {
      updateHeaderUI(user);
   }

   /* hae ravintolat */
   const [restaurants, location] = await Promise.all([getRestaurants(), getUserLocation()]);

   allRestaurants = restaurants;
   userLocation = location;

   /* laske etäisyydet ja lajittele lähimmästä alkaen, jos sijainti saatavilla */
   if (userLocation && Array.isArray(allRestaurants) && allRestaurants.length > 0) {
      const [userLat, userLon] = userLocation;
      allRestaurants.forEach((rest) => {
         const [lon, lat] = rest.location.coordinates;
         rest._distance = getDistance(userLat, userLon, lat, lon);
      });
      allRestaurants.sort((a, b) => (a._distance || Infinity) - (b._distance || Infinity));
      closestIndex = 0;

      /* siirrä kartta käyttäjän sijaintiin */
      map.setView(userLocation, 10);

      /* lisää käyttäjän sijainti merkki */
      L.circleMarker(userLocation, {
         radius: 8,
         fillColor: '#3b8beb',
         color: '#fff',
         weight: 2,
         fillOpacity: 1,
      }).addTo(map);
   } else {
      closestIndex = -1;
   }

   /* täytä dropdownit oikealla datalla */
   populateFilters(allRestaurants);

   /* generoi kortit ja karttamerkit */
   renderCards(allRestaurants, closestIndex);
   addRestaurantsToMap(allRestaurants, closestIndex);
};

/* populate Filters */
const populateFilters = (restaurants) => {
   /* kaupungit */
   const cities = [...new Set(restaurants.map((r) => r.city).filter(Boolean))].sort();
   const cityItems = document.querySelector('#city_select .select-items');
   cityItems.innerHTML = '<div data-value="">Kaikki kaupungit</div>';
   cities.forEach((city) => {
      const div = document.createElement('div');
      div.dataset.value = city;
      div.textContent = city;
      cityItems.appendChild(div);
   });

   /* yhtiöt */
   const companies = [...new Set(restaurants.map((r) => r.company).filter(Boolean))].sort();
   const companyItems = document.querySelector('#company_select .select-items');
   companyItems.innerHTML = '<div data-value="">Kaikki yhtiöt</div>';
   companies.forEach((company) => {
      const div = document.createElement('div');
      div.dataset.value = company;
      div.textContent = company;
      companyItems.appendChild(div);
   });

   initDropdownListeners();
};

/* käynnistä kun sivu latautuu */
document.addEventListener('DOMContentLoaded', init);
