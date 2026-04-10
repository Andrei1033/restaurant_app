let currentLang = 'fi';
let allRestaurants = [];
let closestIndex = 0;

const init = async () => {

   /* alusta kartta */
   initMap();

   /* hae ravintolat */
   allRestaurants = await getRestaurants();

   /* laske etäisyydet ja lajittele lähimmästä alkaen, jos sijainti saatavilla */
   if (userLocation && Array.isArray(allRestaurants) && allRestaurants.length > 0) {
      const [userLat, userLon] = userLocation;
      allRestaurants.forEach(rest => {
         const [lon, lat] = rest.location.coordinates;
         rest._distance = getDistance(userLat, userLon, lat, lon);
      });
      allRestaurants.sort((a, b) => (a._distance || Infinity) - (b._distance || Infinity));
      closestIndex = 0;
   } else {
      closestIndex = -1;
   }

   /* generoi kortit ja karttamerkit */
   renderCards(allRestaurants, closestIndex);
   addRestaurantsToMap(allRestaurants, closestIndex);
};

/* käynnistä kun sivu latautuu */
document.addEventListener('DOMContentLoaded', init);
