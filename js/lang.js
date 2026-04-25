const translations = {
   fi: {
      /* header */
      login: 'Kirjaudu sisään',
      register: 'Rekisteröidy',
      logout: 'Kirjaudu ulos',

      /* filters */
      filterCity: 'Kaupunki',
      filterCompany: 'Yhtiö',
      filterSearch: 'Haku',
      filterSearchPlaceholder: 'Hae ravintoloita...',
      filterFavourites: 'Näytä suosikit',
      allCities: 'Kaikki kaupungit',
      allCompanies: 'Kaikki yhtiöt',

      /* cards */
      showMenu: 'Näytä valikko',
      showMap: 'Näytä kartta',
      closest: 'Lähin',
      noMenu: 'Valikko ei ole saatavissa',
      noRestaurants: 'Ei ravintoloita saatavilla',

      /* menu modal */
      dailyMenu: 'Päivän menu',
      weeklyMenu: 'Viikon menu',
      noDaily: 'Ei menua tänään',
      noWeekly: 'Ei viikon menua saatavilla',
      showOnMap: 'Näytä kartalla',
      close: 'Sulje',

      /* login modal */
      loginTitle: 'Kirjaudu sisään',
      loginUsername: 'Käyttäjänimi',
      loginPassword: 'Salasana',
      loginClose: 'Sulje',
      loginSubmit: 'Kirjaudu',
      loginSwitch: 'Ei tiliä?',
      loginSwitchLink: 'Rekisteröidy',

      /* register modal */
      registerTitle: 'Rekisteröidy',
      registerUsername: 'Käyttäjänimi',
      registerEmail: 'Sähköposti',
      registerEmailPlaceholder: 'sähköposti@example.com',
      registerClose: 'Sulje',
      registerPassword: 'Salasana',
      registerSubmit: 'Rekisteröidy',
      registerSwitch: 'On jo tili?',
      registerSwitchLink: 'Kirjaudu',

      /* profile modal */
      profileTitle: 'Profiili',
      avatar_change_btn: 'Vaihda kuva',
      profileUsername: 'Käyttäjänimi',
      profileEmail: 'Sähköposti',
      profilePassword: 'Uusi salasana',
      profilePasswordPlaceholder: 'Jätä tyhjäksi jos ei muutosta',
      profileClose: 'Sulje',
      profileSave: 'Tallenna',
      profileChangeAvatar: 'Vaihda kuva',
      deleteAccount: 'Poista tili',

      /* account delete modal */
      accountDeleteTitle: 'Vahvista tilin poisto',
      accountDeleteText: 'Oletko varma että haluat poistaa tilisi? Tämä toimintoa ei voi peruuttaa.',
      accountCancel: 'Peruuta',
      accountDeleteBtn: 'Poista tili',

      /* map popup */
      popupMenuBtn: 'Näytä menu',
      popupNoMenu: 'Ei menua tänään',
      userLocationPopup: 'Olet tässä',

      /* notifications */
      notifFavAdded: 'Suosikki asetettu',
      notifFavRemoved: 'Suosikki poistettu',
      notifLoggedOut: 'Olet kirjautunut ulos',
      notifProfileUpdated: 'Profiili päivitetty onnistuneesti!',
      notifAvatarUpdated: 'Profiilikuva päivitetty!',
      notifAccountDeleted: 'Tilisi on poistettu onnistuneesti',
      notifLoginRequired: 'Kirjaudu sisään asettaaksesi suosikkeja',

      /* errors */
      errFillAll: 'Täytä kaikki kentät',
      errNetwork: 'Verkkovirhe, yritä uudelleen',
      errLoginFailed: 'Kirjautuminen epäonnistui',
      errRegisterFailed: 'Rekisteröinti epäonnistui',

      /* misc */
      loading: 'Ladataan...',
      saving: 'Tallennetaan...',
      noChanges: 'Ei muutoksia päivitettäväksi',
      confirmDeleteTitle: 'Vahvista tilin poisto',
      confirmDeleteText: 'Oletko varma että haluat poistaa tilisi? Tämä toimintoa ei voi peruuttaa.',
      confirmCancel: 'Peruuta',
      confirmDeleteBtn: 'Poista tili',

      /* footer */
      footer: '2026 © Opiskelija ravintola compass',
   },

   en: {
      /* header */
      login: 'Login',
      register: 'Register',
      logout: 'Logout',

      /* filters */
      filterCity: 'City',
      filterCompany: 'Company',
      filterSearch: 'Search',
      filterSearchPlaceholder: 'Search restaurants...',
      filterFavourites: 'Show favourites',
      allCities: 'All cities',
      allCompanies: 'All companies',

      /* cards */
      showMenu: 'Show menu',
      showMap: 'Show on map',
      closest: 'Nearest',
      noMenu: 'Menu not available',
      noRestaurants: 'No restaurants available',

      /* menu modal */
      dailyMenu: 'Daily menu',
      weeklyMenu: 'Weekly menu',
      noDaily: 'No menu today',
      noWeekly: 'No weekly menu available',
      showOnMap: 'Show on map',
      close: 'Close',

      /* login modal */
      loginTitle: 'Login',
      loginUsername: 'Username',
      loginPassword: 'Password',
      loginSubmit: 'Login',
      loginClose: 'Close',
      loginSwitch: 'No account?',
      loginSwitchLink: 'Register',

      /* register modal */
      registerTitle: 'Register',
      registerUsername: 'Username',
      registerEmail: 'Email',
      registerEmailPlaceholder: 'email@example.com',
      registerPassword: 'Password',
      registerSubmit: 'Register',
      registerClose: 'Close',
      registerSwitch: 'Already have an account?',
      registerSwitchLink: 'Login',

      /* profile modal */
      profileTitle: 'Profile',
      avatar_change_btn: 'Change photo',
      profileUsername: 'Username',
      profileEmail: 'Email',
      profilePassword: 'New password',
      profilePasswordPlaceholder: 'Leave empty if no change',
      profileSave: 'Save',
      profileChangeAvatar: 'Change photo',
      profileClose: 'Close',
      deleteAccount: 'Delete account',

      /* account delete modal */
      accountDeleteTitle: 'Confirm account deletion',
      accountDeleteText: 'Are you sure you want to delete your account? This action cannot be undone.',
      accountCancel: 'Cancel',
      accountDeleteBtn: 'Delete account',

      /* map popup */
      popupMenuBtn: 'Show menu',
      popupNoMenu: 'No menu today',
      userLocationPopup: 'You are here',

      /* notifications */
      notifFavAdded: 'Favourite set',
      notifFavRemoved: 'Favourite removed',
      notifLoggedOut: 'You have been logged out',
      notifProfileUpdated: 'Profile updated successfully!',
      notifAvatarUpdated: 'Profile picture updated!',
      notifAccountDeleted: 'Your account has been deleted',
      notifLoginRequired: 'Login to set favourites',

      /* errors */
      errFillAll: 'Please fill in all fields',
      errNetwork: 'Network error, please try again',
      errLoginFailed: 'Login failed',
      errRegisterFailed: 'Registration failed',

      /* misc */
      loading: 'Loading...',
      saving: 'Saving...',
      noChanges: 'No changes to update',
      confirmDeleteTitle: 'Confirm account deletion',
      confirmDeleteText: 'Are you sure you want to delete your account? This action cannot be undone.',
      confirmCancel: 'Cancel',
      confirmDeleteBtn: 'Delete account',

      /* footer */
      footer: '2026 © Student Restaurant Compass',
   },
};

/* get translation */
const t = (key) => {
   return translations[currentLang]?.[key] || translations['fi'][key] || key;
};

// expose translator to other modules
window.t = t;

/* update all static texts on the page */
const applyLanguage = () => {
   /* header */
   document.getElementById('login_button').textContent = t('login');
   document.getElementById('register_button').textContent = t('register');

   /* filters */
   document.querySelector('#filters_div .filter-group:nth-child(1) label').textContent = t('filterCity');
   document.querySelector('#filters_div .filter-group:nth-child(2) label').textContent = t('filterCompany');
   document.querySelector('#filters_div .filter-group:nth-child(3) label').textContent = t('filterSearch');
   document.getElementById('search_input').placeholder = t('filterSearchPlaceholder');
   document.getElementById('favourites_button').textContent = t('filterFavourites');

   /* dropdown default texts */
   document.querySelector('#city_select .select-selected').textContent = t('allCities');
   document.querySelector('#company_select .select-selected').textContent = t('allCompanies');

   /* menu modal tabs */
   document.getElementById('tab_daily').textContent = t('dailyMenu');
   document.getElementById('tab_weekly').textContent = t('weeklyMenu');
   document.getElementById('menu_close').textContent = t('close');
   document.getElementById('menu_show_map').textContent = t('showOnMap');

   /* login modal */
   document.querySelector('#login_modal h2').textContent = t('loginTitle');
   document.querySelector('label[for="login_username"]').textContent = t('loginUsername');
   document.querySelector('label[for="login_password"]').textContent = t('loginPassword');
   document.getElementById('login_username').placeholder = t('loginUsername');
   document.getElementById('login_password').placeholder = t('loginPassword');
   document.getElementById('login_submit').textContent = t('loginSubmit');
   document.getElementById('login_close').textContent = t('loginClose');
   document.getElementById('switch_to_register').textContent = t('loginSwitchLink');

   /* register modal */
   document.querySelector('#register_modal h2').textContent = t('registerTitle');
   document.querySelector('label[for="register_username"]').textContent = t('registerUsername');
   document.querySelector('label[for="register_email"]').textContent = t('registerEmail');
   document.querySelector('label[for="register_password"]').textContent = t('registerPassword');
   document.getElementById('register_username').placeholder = t('registerUsername');
   document.getElementById('register_email').placeholder = t('registerEmailPlaceholder');
   document.getElementById('register_password').placeholder = t('registerPassword');
   document.getElementById('register_submit').textContent = t('registerSubmit');
   document.getElementById('switch_to_login').textContent = t('registerSwitchLink');
   document.getElementById('register_close').textContent = t('registerClose');

   /* profile modal */
   document.querySelector('#profile_modal h2').textContent = t('profileTitle');
   document.querySelector('.avatar-upload-btn').textContent = t('avatar_change_btn');
   document.querySelector('label[for="profile_username"]').textContent = t('profileUsername');
   document.querySelector('label[for="profile_email"]').textContent = t('profileEmail');
   document.querySelector('label[for="profile_password"]').textContent = t('profilePassword');
   document.getElementById('profile_password').placeholder = t('profilePasswordPlaceholder');
   document.getElementById('profile_submit').textContent = t('profileSave');
   document.getElementById('logout_button').textContent = t('logout');
   document.getElementById('delete_account_button').textContent = t('deleteAccount');
   document.getElementById('profile_close').textContent = t('profileClose');

   /* account delete modal */
   try {
      document.querySelector('.aaa h3').textContent = t('accountDeleteTitle');
      document.querySelector('.aaa p').textContent = t('accountDeleteText');
      document.querySelector('#confirm_cancel_btn').textContent = t('accountCancel');
      document.querySelector('#confirm_delete_btn').textContent = t('accountDeleteBtn');
   } catch (e) {
      console.log('Account delete modal not found, skipping language update for it' + e);
   }
   /* footer */
   document.querySelector('footer').textContent = t('footer');

   /* update cards with the new language */
   if (allRestaurants.length > 0) {
      renderCards(currentFilteredRestaurants || allRestaurants, closestIndex);
   }
};
