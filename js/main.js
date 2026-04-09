let currentLang = 'fi';
let allRestaurants = [];
let closestIndex = 0;

const init = async () => {

   /* alusta kartta */
   initMap();

   /* hae ravintolat */
   allRestaurants = await getRestaurants();

   /* laske lähin jos sijainti saatavilla */
   if (userLocation) {
      closestIndex = findClosest(allRestaurants, userLocation[0], userLocation[1]);
   }

   /* generoi kortit ja karttamerkit */
   renderCards(allRestaurants, closestIndex);
   addRestaurantsToMap(allRestaurants, closestIndex);
};

/* käynnistä kun sivu latautuu */
document.addEventListener('DOMContentLoaded', init);
