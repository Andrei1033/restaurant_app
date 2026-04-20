let activeFilters = {
   city: '',
   company: '',
   search: '',
   favourite: false,
};
let currentFilteredRestaurants = null;
let currentFavouriteId = null;

/* language select ui*/
const langBtns = document.querySelectorAll('.lang-btn');

langBtns.forEach((btn) => {
   btn.addEventListener('click', () => {
      langBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;
      console.log('Kieli vaihdettu:', lang);
      // myöhemmin tähän API-kutsu oikealla kielellä
   });
});

/* päivitä header kirjautumisen mukaan */
const updateHeaderUI = (user) => {
   const loginButtons = document.getElementById('login_buttons');
   const userProfile = document.getElementById('user_profile');
   const headerAvatar = document.getElementById('header_avatar');

   if (user) {
      /* kirjautunut — piilota napit, näytä profiili */
      loginButtons.style.display = 'none';
      userProfile.style.display = 'block';

      if (user.avatar) {
         headerAvatar.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`;
      } else {
         headerAvatar.src = '../assets/tremplate_profile.jpg';
      }
   } else {
      /* ei kirjautunut — näytä napit, piilota profiili */
      loginButtons.style.display = 'block';
      userProfile.style.display = 'none';
   }
};

/* kirjautuminen */
document.getElementById('login_submit').addEventListener('click', async () => {
   const username = document.getElementById('login_username').value;
   const password = document.getElementById('login_password').value;
   const errorEl = document.getElementById('login_error');

   if (!username || !password) {
      errorEl.textContent = 'Täytä kaikki kentät';
      return;
   }

   /* muuta nappi ladaustilaan */
   const submitButton = document.getElementById('login_submit');
   submitButton.textContent = 'Ladataan...';
   submitButton.disabled = true;

   const result = await login(username, password);

   submitButton.textContent = 'Kirjaudu';
   submitButton.disabled = false;

   if (result.success) {
      updateHeaderUI(result.user);
      closeModal('login');
      errorEl.textContent = '';
      /* tyhjää kentät */
      document.getElementById('login_username').value = '';
      document.getElementById('login_password').value = '';
   } else {
      errorEl.textContent = result.message;
   }
});

// Täytä profiilimodaalin kentät
const populateProfileModal = async () => {
   const user = await getUserProfile();
   if (!user) return;

   // Aseta placeholderit tuoreilla tiedoilla
   document.getElementById('profile_username').placeholder = user.username || 'Käyttäjänimi';
   document.getElementById('profile_email').placeholder = user.email || 'Sähköposti';
   document.getElementById('profile_password').placeholder = 'Jätä tyhjäksi jos ei muutosta';

   // Tyhjennä input-kentät (ettei vanhat arvot jää näkymään)
   document.getElementById('profile_username').value = '';
   document.getElementById('profile_email').value = '';
   document.getElementById('profile_password').value = '';

   // Päivitä profiilikuva modaaliin - HAETAAN PALVELIMELTA
   if (user.avatar) {
      // Lisää aikaleima estämään välimuistiongelmat
      const avatarUrl = `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}?t=${Date.now()}`;
      document.getElementById('profile_avatar_preview').src = avatarUrl;
   } else {
      document.getElementById('profile_avatar_preview').src = '../assets/tremplate_profile.jpg';
   }
};

// Käsittele profiilin päivitys
const handleAvatarUpload = async (file) => {
   if (!file) return;

   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
   if (!allowedTypes.includes(file.type)) {
      const errorEl = document.getElementById('profile_error');
      errorEl.style.color = '#f44336';
      errorEl.textContent = 'Vain kuvatiedostot (JPEG, PNG, GIF) ovat sallittuja';
      setTimeout(() => {
         errorEl.textContent = '';
         errorEl.style.color = '';
      }, 3000);
      return;
   }

   if (file.size > 5 * 1024 * 1024) {
      const errorEl = document.getElementById('profile_error');
      errorEl.style.color = '#f44336';
      errorEl.textContent = 'Kuvan maksimikoko on 5MB';
      setTimeout(() => {
         errorEl.textContent = '';
         errorEl.style.color = '';
      }, 3000);
      return;
   }

   // Näytä esikatselu heti
   const reader = new FileReader();
   reader.onload = (e) => {
      document.getElementById('profile_avatar_preview').src = e.target.result;
   };
   reader.readAsDataURL(file);

   const result = await uploadAvatar(file);

   if (result.success) {
      // Hae tuoreet käyttäjätiedot palvelimelta
      const updatedUser = await getUserProfile();
      if (updatedUser) {
         // Päivitä header
         updateHeaderUI(updatedUser);

         // Päivitä modaalin placeholderit (jos nimi/email on muuttunut)
         if (updatedUser.username) {
            document.getElementById('profile_username').placeholder = updatedUser.username;
         }
         if (updatedUser.email) {
            document.getElementById('profile_email').placeholder = updatedUser.email;
         }

         // Päivitä profiilikuva uudelleen varmuuden vuoksi
         if (updatedUser.avatar) {
            const avatarUrl = `https://media2.edu.metropolia.fi/restaurant/uploads/${updatedUser.avatar}?t=${Date.now()}`;
            document.getElementById('profile_avatar_preview').src = avatarUrl;
         }
      }

      const errorEl = document.getElementById('profile_error');
      errorEl.style.color = '#4caf50';
      errorEl.textContent = 'Profiilikuva päivitetty!';
      setTimeout(() => {
         errorEl.textContent = '';
         errorEl.style.color = '';
      }, 3000);
   } else {
      const errorEl = document.getElementById('profile_error');
      errorEl.style.color = '#f44336';
      errorEl.textContent = result.message;
      setTimeout(() => {
         errorEl.textContent = '';
         errorEl.style.color = '';
      }, 3000);
   }
};

// Käsittele profiilikuvan lataus
const handleProfileUpdate = async () => {
   const usernameInput = document.getElementById('profile_username');
   const emailInput = document.getElementById('profile_email');
   const passwordInput = document.getElementById('profile_password');
   const errorEl = document.getElementById('profile_error');

   // Tyhjennä vanha virhe
   errorEl.textContent = '';
   errorEl.style.color = '#f44336';

   const updatedData = {};
   const errors = [];

   // Tarkista käyttäjänimi (jos yritetään vaihtaa)
   if (usernameInput.value.trim()) {
      const newUsername = usernameInput.value.trim();
      if (newUsername.length < 3) {
         errors.push('Käyttäjänimen tulee olla vähintään 3 merkkiä pitkä');
      } else if (newUsername.length > 30) {
         errors.push('Käyttäjänimi voi olla enintään 30 merkkiä pitkä');
      } else if (!/^[a-zA-Z0-9_.-]+$/.test(newUsername)) {
         errors.push('Käyttäjänimi voi sisältää vain kirjaimia, numeroita, alaviivoja, pisteitä ja viivoja');
      } else {
         updatedData.username = newUsername;
      }
   }

   // Tarkista sähköposti (jos yritetään vaihtaa)
   if (emailInput.value.trim()) {
      const newEmail = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
         errors.push('Syötä kelvollinen sähköpostiosoite');
      } else {
         updatedData.email = newEmail;
      }
   }

   // Tarkista salasana (jos yritetään vaihtaa)
   if (passwordInput.value.trim()) {
      const newPassword = passwordInput.value.trim();
      if (newPassword.length < 6) {
         errors.push('Salasanan tulee olla vähintään 6 merkkiä pitkä');
      } else if (newPassword.length > 100) {
         errors.push('Salasana on liian pitkä');
      } else {
         updatedData.password = newPassword;
      }
   }

   // Näytä validaatiovirheet
   if (errors.length > 0) {
      errorEl.textContent = errors.join('. ');
      return;
   }

   // Jos ei mitään päivitettävää
   if (Object.keys(updatedData).length === 0) {
      errorEl.textContent = 'Ei muutoksia päivitettäväksi';
      setTimeout(() => {
         errorEl.textContent = '';
      }, 3000);
      return;
   }

   const submitButton = document.getElementById('profile_submit');
   const originalButtonText = submitButton.textContent;
   submitButton.textContent = 'Tallennetaan...';
   submitButton.disabled = true;

   const result = await updateUserProfile(updatedData);

   submitButton.textContent = originalButtonText;
   submitButton.disabled = false;

   if (result.success) {
      // Hae tuoreet käyttäjätiedot palvelimelta
      const updatedUser = await getUserProfile();
      if (updatedUser) {
         updateHeaderUI(updatedUser);

         // Päivitä placeholderit uusilla tiedoilla
         document.getElementById('profile_username').placeholder = updatedUser.username || 'Käyttäjänimi';
         document.getElementById('profile_email').placeholder = updatedUser.email || 'Sähköposti';

         // Päivitä profiilikuva
         if (updatedUser.avatar) {
            const avatarUrl = `https://media2.edu.metropolia.fi/restaurant/uploads/${updatedUser.avatar}?t=${Date.now()}`;
            document.getElementById('profile_avatar_preview').src = avatarUrl;
         }
      }

      // Tyhjennä input-kentät
      usernameInput.value = '';
      emailInput.value = '';
      passwordInput.value = '';

      errorEl.style.color = '#4caf50';
      errorEl.textContent = 'Profiili päivitetty onnistuneesti!';
      setTimeout(() => {
         errorEl.textContent = '';
      }, 3000);
   } else {
      // Käsittele backend-virheet käyttäjäystävällisesti
      let errorMessage = '';

      if (result.message.includes('E11000') || result.message.includes('duplicate key')) {
         if (result.message.includes('email')) {
            errorMessage = 'Tämä sähköpostiosoite on jo toisen käyttäjän käytössä. Käytä toista sähköpostia.';
         } else if (result.message.includes('username')) {
            errorMessage = 'Tämä käyttäjänimi on jo varattu. Valitse toinen käyttäjänimi.';
         } else {
            errorMessage = 'Sähköposti tai käyttäjänimi on jo käytössä.';
         }
      } else if (result.message.includes('password')) {
         errorMessage = 'Salasana on liian heikko. Käytä vähintään 6 merkkiä.';
      } else if (result.message.includes('validation')) {
         errorMessage = 'Tarkista että kaikki kentät on täytetty oikein.';
      } else {
         errorMessage = result.message || 'Päivitys epäonnistui. Yritä uudelleen.';
      }

      errorEl.textContent = errorMessage;
      setTimeout(() => {
         if (errorEl.textContent === errorMessage) {
            errorEl.textContent = '';
         }
      }, 5000);
   }
};

// Alusta profiilimodaalin event listenerit
const initProfileModal = () => {
   const avatarInput = document.getElementById('profile_avatar_input');
   if (avatarInput) {
      // Poista vanhat listenerit
      const newAvatarInput = avatarInput.cloneNode(true);
      avatarInput.parentNode.replaceChild(newAvatarInput, avatarInput);

      newAvatarInput.addEventListener('change', (e) => {
         if (e.target.files && e.target.files[0]) {
            handleAvatarUpload(e.target.files[0]);
         }
         // Tyhjennä input, jotta sama tiedosto voidaan valita uudelleen
         e.target.value = '';
      });
   }

   const uploadBtn = document.querySelector('.avatar-upload-btn');
   if (uploadBtn) {
      const newUploadBtn = uploadBtn.cloneNode(true);
      uploadBtn.parentNode.replaceChild(newUploadBtn, uploadBtn);

      newUploadBtn.addEventListener('click', () => {
         document.getElementById('profile_avatar_input').click();
      });
   }

   const submitBtn = document.getElementById('profile_submit');
   if (submitBtn) {
      const newSubmitBtn = submitBtn.cloneNode(true);
      submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

      newSubmitBtn.addEventListener('click', handleProfileUpdate);
   }

   const logoutBtn = document.getElementById('logout_button');
   if (logoutBtn) {
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

      newLogoutBtn.addEventListener('click', () => {
         logout();
         closeModal('profile');
         // Tyhjennä kentät
         document.getElementById('profile_username').value = '';
         document.getElementById('profile_email').value = '';
         document.getElementById('profile_password').value = '';
         document.getElementById('profile_username').placeholder = 'Käyttäjänimi';
         document.getElementById('profile_email').placeholder = 'Sähköposti';
         document.getElementById('profile_avatar_preview').src = '../assets/tremplate_profile.jpg';
      });
   }

   createConfirmModal();
   // Poista tili -nappi
   const deleteAccountBtn = document.getElementById('delete_account_button');
   if (deleteAccountBtn) {
      const newDeleteBtn = deleteAccountBtn.cloneNode(true);
      deleteAccountBtn.parentNode.replaceChild(newDeleteBtn, deleteAccountBtn);

      newDeleteBtn.addEventListener('click', handleDeleteAccount);
   }
};

// Luo profili poisto vahvistusmodaali
const createConfirmModal = () => {
   // Tarkista onko jo olemassa
   if (document.getElementById('confirm_modal')) return;

   const confirmModalHTML = `
      <div id="confirm_modal" class="modal-overlay">
         <div class="modal confirm-modal">
            <h3>Vahvista tilin poisto</h3>
            <p>Oletko varma että haluat poistaa tilisi?<br>Tätä toimintoa ei voi peruuttaa.</p>
            <div class="modal-footer">
               <button id="confirm_cancel_btn">Peruuta</button>
               <button id="confirm_delete_btn" class="delete-account-btn">Poista tili</button>
            </div>
         </div>
      </div>
   `;

   document.body.insertAdjacentHTML('beforeend', confirmModalHTML);

   // Lisää tyylit vahvistusmodaalille
   const style = document.createElement('style');
   style.textContent = `
      .confirm-modal {
         max-width: 400px;
      }
      .confirm-modal p {
         margin: 20px 0;
         text-align: center;
         line-height: 1.5;
      }
      #confirm_cancel_btn {
         background-color: #6c757d;
         color: white;
         border: none;
         padding: 10px 20px;
         border-radius: 6px;
         cursor: pointer;
         font-weight: 600;
      }
      #confirm_cancel_btn:hover {
         background-color: #5a6268;
      }
   `;
   document.head.appendChild(style);
};

// Käsittele tilin poisto
const handleDeleteAccount = async () => {
   const confirmModal = document.getElementById('confirm_modal');
   const cancelBtn = document.getElementById('confirm_cancel_btn');
   const deleteBtn = document.getElementById('confirm_delete_btn');

   // Näytä vahvistusmodaali
   confirmModal.classList.add('active');

   // Poista vanhat listenerit
   const newCancelBtn = cancelBtn.cloneNode(true);
   cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

   const newDeleteBtn = deleteBtn.cloneNode(true);
   deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);

   // Peruuta toiminto
   newCancelBtn.addEventListener('click', () => {
      confirmModal.classList.remove('active');
   });

   // Vahvista poisto
   newDeleteBtn.addEventListener('click', async () => {
      // Poista vanha teksti ja disabloi nappi
      const originalText = newDeleteBtn.textContent;
      newDeleteBtn.textContent = 'Poistetaan...';
      newDeleteBtn.disabled = true;

      const result = await deleteUserAccount();

      if (result.success) {
         // Sulje molemmat modaalit
         confirmModal.classList.remove('active');
         closeModal('profile');

         // Näytä onnistumisviesti (voit luoda pienen ilmoituksen)
         showNotification('Tilisi on poistettu onnistuneesti', 'success');

         // Päivitä header (näytetään kirjautumisnapot)
         updateHeaderUI(null);

         // Ohjaa etusivulle tai päivitä näkymä
         setTimeout(() => {
            window.location.reload();
         }, 2000);
      } else {
         newDeleteBtn.textContent = originalText;
         newDeleteBtn.disabled = false;

         // Näytä virheilmoitus
         showNotification(result.message, 'error');
         confirmModal.classList.remove('active');
      }
   });

   // Sulje klikkaamalla overlayta
   confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
         confirmModal.classList.remove('active');
      }
   });
};

// Apufunktio ilmoituksille
const showNotification = (message, type = 'success') => {
   // Poista vanha notifikaatio jos on
   const oldNotification = document.getElementById('notification');
   if (oldNotification) oldNotification.remove();

   const notification = document.createElement('div');
   notification.id = 'notification';
   notification.textContent = message;
   notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
   `;

   document.body.appendChild(notification);

   // Lisää animaatio
   if (!document.querySelector('#notification-style')) {
      const style = document.createElement('style');
      style.id = 'notification-style';
      style.textContent = `
         @keyframes slideIn {
            from {
               transform: translateX(100%);
               opacity: 0;
            }
            to {
               transform: translateX(0);
               opacity: 1;
            }
         }
      `;
      document.head.appendChild(style);
   }

   // Poista notifikaatio 3 sekunnin jälkeen
   setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
   }, 3000);
};

// Lataa käyttäjän suosikki
const loadUserFavourite = async () => {
   const user = await getUserProfile();
   if (user && user.favouriteRestaurant) {
      currentFavouriteId = user.favouriteRestaurant;
   } else {
      currentFavouriteId = null;
   }

   // Päivitä kaikkien sydämien tilat
   updateAllHeartButtons();
};

// Päivitä tietyn kortin sydännappi
const updateHeartButton = (card, restaurantId, isFavourite) => {
   const heartBtn = card.querySelector('.card_favourite');
   if (!heartBtn) return;

   if (isFavourite) {
      heartBtn.classList.add('active');
   } else {
      heartBtn.classList.remove('active');
   }
};

// Päivitä kaikki sydännapit
const updateAllHeartButtons = () => {
   // Päivitä korttien sydämet
   document.querySelectorAll('.card').forEach((card) => {
      const restaurantId = card.dataset.id;
      if (restaurantId) {
         updateHeartButton(card, restaurantId, currentFavouriteId === restaurantId);
      }
   });

   // Päivitä menu-modalin sydän
   const menuHeart = document.getElementById('menu_modal_favourite');
   if (menuHeart && currentRestaurantInMenu) {
      if (currentFavouriteId === currentRestaurantInMenu) {
         menuHeart.classList.add('active');
      } else {
         menuHeart.classList.remove('active');
      }
   }
};

// Käsittele suosikin asetus/poisto
const handleFavouriteToggle = async (restaurantId, heartButton) => {
   const token = getToken();
   if (!token) {
      showNotification('Kirjaudu sisään asettaaksesi suosikkeja', 'error');
      openModal('login');
      return false;
   }

   // Tarkista onko tämä jo suosikki
   const isFavourite = currentFavouriteId === restaurantId;

   if (isFavourite) {
      // Poista suosikki
      const result = await removeFavouriteRestaurant();
      if (result.success) {
         currentFavouriteId = null;
         if (heartButton) heartButton.classList.remove('active');
         showNotification('Suosikki poistettu', 'success');

         // Jos suosikkifiltteri on päällä, päivitä näkymä
         if (activeFilters.favourite) {
            applyFilters();
         }
         return false;
      } else {
         showNotification(result.message, 'error');
         return false;
      }
   } else {
      // Aseta uusi suosikki (korvaa vanhan)
      const result = await updateFavouriteRestaurant(restaurantId);
      if (result.success) {
         currentFavouriteId = restaurantId;

         // Päivitä kaikki sydännapit (poista active muualta)
         updateAllHeartButtons();

         showNotification('Suosikki asetettu', 'success');

         // Jos suosikkifiltteri on päällä, päivitä näkymä
         if (activeFilters.favourite) {
            applyFilters();
         }
         return true;
      } else {
         showNotification(result.message, 'error');
         return false;
      }
   }
};

// Muuttuja menu-modalin nykyiselle ravintolalle
let currentRestaurantInMenu = null;

/* filters*/
const applyFilters = () => {
   let filtered = [...allRestaurants];

   /* kaupunki filtteri */
   if (activeFilters.city) {
      filtered = filtered.filter((r) => r.city?.toLowerCase() === activeFilters.city.toLowerCase());
   }

   /* yritys filtteri */
   if (activeFilters.company) {
      filtered = filtered.filter((r) => r.company?.toLowerCase() === activeFilters.company.toLowerCase());
   }

   /* hakukenttä — nimi tai osoite */
   if (activeFilters.search) {
      const search = activeFilters.search.toLowerCase();
      filtered = filtered.filter((r) => r.name?.toLowerCase().includes(search) || r.address?.toLowerCase().includes(search) || r.city?.toLowerCase().includes(search));
   }

   // Suosikkifiltteri
   if (activeFilters.favourite) {
      if (currentFavouriteId) {
         filtered = filtered.filter((r) => r._id === currentFavouriteId);
      } else {
         filtered = []; // Ei suosikkia, näytä tyhjä lista
      }
   }

   /* render cards */
   currentFilteredRestaurants = filtered;
   currentPage = 1;
   renderCards(filtered, closestIndex);
};

// filters dropdown
const initDropdownListeners = () => {
   document.querySelectorAll('.custom-select').forEach((select) => {
      const selected = select.querySelector('.select-selected');
      const items = select.querySelector('.select-items');

      const newSelected = selected.cloneNode(true);
      selected.parentNode.replaceChild(newSelected, selected);

      newSelected.addEventListener('click', () => {
         const isOpen = !items.classList.contains('select-hide');
         document.querySelectorAll('.custom-select').forEach((s) => {
            s.querySelector('.select-items').classList.add('select-hide');
            s.classList.remove('open');
         });
         if (!isOpen) {
            items.classList.remove('select-hide');
            select.classList.add('open');
         }
      });

      items.querySelectorAll('div').forEach((item) => {
         item.addEventListener('click', () => {
            items.querySelectorAll('div').forEach((i) => i.classList.remove('selected'));
            item.classList.add('selected');
            newSelected.textContent = item.textContent;
            items.classList.add('select-hide');
            select.classList.remove('open');

            if (select.id === 'city_select') {
               activeFilters.city = item.dataset.value;
            } else if (select.id === 'company_select') {
               activeFilters.company = item.dataset.value;
            }
            applyFilters();
         });
      });
   });

   document.addEventListener('click', (e) => {
      document.querySelectorAll('.custom-select').forEach((select) => {
         if (!select.contains(e.target)) {
            select.querySelector('.select-items').classList.add('select-hide');
            select.classList.remove('open');
         }
      });
   });
};

/* alusta heti sivun latautuessa */
initDropdownListeners();

/* hakukenttä */
const searchInput = document.getElementById('search_input');
searchInput.addEventListener('input', (e) => {
   activeFilters.search = e.target.value.trim();
   applyFilters();
});

/* suosikit nappi */
const initFavouriteFilter = () => {
   const favButton = document.getElementById('favourites_button');
   if (favButton) {
      const newFavButton = favButton.cloneNode(true);
      favButton.parentNode.replaceChild(newFavButton, favButton);

      newFavButton.addEventListener('click', () => {
         activeFilters.favourite = !activeFilters.favourite;
         newFavButton.classList.toggle('active', activeFilters.favourite);
         applyFilters();
      });
   }
};

/* generate one card by api data*/
const createCard = async (restaurant, isClosest) => {
   const card = document.createElement('div');
   card.classList.add('card');
   card.dataset.id = restaurant._id;
   card.dataset.city = restaurant.city;
   card.dataset.company = restaurant.company;

   /* tarkista onko menue saatavilla */
   const dailyCourses = await getDailyMenu(restaurant._id, currentLang);
   const weeklyDays = await getWeeklyMenu(restaurant._id, currentLang);
   const hasDaily = dailyCourses && dailyCourses.length > 0;
   const hasWeekly = weeklyDays && weeklyDays.length > 0;
   const hasMenu = hasDaily || hasWeekly;

   card.innerHTML = `
      <div class="upper_card">
         <div class="card_info">
         <h2>${restaurant.name}</h2>
         <p>${restaurant.city} | ${restaurant.company}</p>
         </div>
         <div class="card_indicators">
         ${isClosest ? '<span class="closest_indicator" id="closest_indicator">Lähin</span>' : ''}
         <button class="card_favourite" aria-label="Lisää suosikkeihin">
            <svg class="heart-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
         </button>
         </div>
      </div>
      <div class="lower_card">
         ${!hasMenu ? '<p class="empty_menu">Valikko ei ole saatavissa</p>' : ''}
         <button class="card_show_menu ${!hasMenu ? 'card_show_menu_empty' : ''}"
         ${!hasMenu ? 'style="display:none"' : ''}>
         Näytä valikko
         </button>
         <button class="card_show_map">Näytä kartta</button>
      </div>
   `;

   /* favourite button */
   const heartBtn = card.querySelector('.card_favourite');
   heartBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await handleFavouriteToggle(restaurant._id, heartBtn);
   });

   /* show menu */
   if (hasMenu) {
      card.querySelector('.card_show_menu').addEventListener('click', async () => {
         const weeklyDays = await getWeeklyMenu(restaurant._id, currentLang);
         window.openMenuModal(restaurant.name, isClosest, false, dailyCourses, weeklyDays, restaurant._id);
      });
   }

   /* show on map */
   card.querySelector('.card_show_map').addEventListener('click', () => {
      const [lon, lat] = restaurant.location.coordinates;
      map.setView([lat, lon], 16);
      window.scrollTo({top: 0, behavior: 'smooth'});
   });

   return card;
};

/* modal logiikka */
const modals = {
   login: document.getElementById('login_modal'),
   register: document.getElementById('register_modal'),
   profile: document.getElementById('profile_modal'),
   menu: document.getElementById('menu_modal'),
};

const openModal = (name) => {
   if (name === 'profile') {
      // Hae aina tuoreet tiedot kun modaali avataan
      populateProfileModal();
   }
   modals[name].classList.add('active');
};

const closeModal = (name) => {
   modals[name].classList.remove('active');

   // Tyhjennä virheilmoitus profiilimodaalista
   if (name === 'profile') {
      const errorEl = document.getElementById('profile_error');
      if (errorEl) {
         errorEl.textContent = '';
         errorEl.style.color = '';
      }
   }
};

/* avaa modalit napeista */
document.getElementById('login_button').addEventListener('click', () => openModal('login'));
document.getElementById('register_button').addEventListener('click', () => openModal('register'));
document.getElementById('user_profile').addEventListener('click', () => {
   populateProfileModal(); // Hae tuoreet tiedot ennen avaamista
   openModal('profile');
});

/* sulje napit */
document.getElementById('login_close').addEventListener('click', () => closeModal('login'));
document.getElementById('register_close').addEventListener('click', () => closeModal('register'));
document.getElementById('profile_close').addEventListener('click', () => closeModal('profile'));

/* sulje klikkaamalla ulkopuolelle */
Object.entries(modals).forEach(([name, overlay]) => {
   overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(name);
   });
});

/* vaihto login <-> register */
document.getElementById('switch_to_register').addEventListener('click', () => {
   closeModal('login');
   openModal('register');
});
document.getElementById('switch_to_login').addEventListener('click', () => {
   closeModal('register');
   openModal('login');
});

/* menu modal */
const menuModal = document.getElementById('menu_modal');
const menuModalBody = document.getElementById('menu_modal_body');
const menuModalName = document.getElementById('menu_modal_name');
const menuModalClosest = document.getElementById('menu_modal_closest');
const menuModalFavourite = document.getElementById('menu_modal_favourite');

const initMenuModalFavourite = () => {
   const menuFavBtn = document.getElementById('menu_modal_favourite');
   if (menuFavBtn) {
      const newMenuFavBtn = menuFavBtn.cloneNode(true);
      menuFavBtn.parentNode.replaceChild(newMenuFavBtn, menuFavBtn);

      newMenuFavBtn.addEventListener('click', async () => {
         if (currentRestaurantInMenu) {
            // Etsi sydännappi vastaavasta kortista
            const card = document.querySelector(`.card[data-id="${currentRestaurantInMenu}"]`);
            const heartBtn = card ? card.querySelector('.card_favourite') : null;

            await handleFavouriteToggle(currentRestaurantInMenu, heartBtn);

            // Päivitä menu-modalin sydän
            if (menuModalFavourite) {
               if (currentFavouriteId === currentRestaurantInMenu) {
                  menuModalFavourite.classList.add('active');
               } else {
                  menuModalFavourite.classList.remove('active');
               }
            }
         }
      });
   }
};

/* avaa menu modal */
window.openMenuModal = async (restaurantName, isClosest, isFavourite, dailyCourses, weeklyDays, restaurantId) => {
   currentRestaurantInMenu = restaurantId;
   menuModalName.textContent = restaurantName;
   menuModalClosest.style.display = isClosest ? 'inline-block' : 'none';

   // Tarkista onko tämä ravintola suosikki
   const isFav = currentFavouriteId === restaurantId;
   if (menuModalFavourite) {
      // TURVALLISUUSTARKISTUS
      if (isFav) {
         menuModalFavourite.classList.add('active');
      } else {
         menuModalFavourite.classList.remove('active');
      }
   }

   currentDailyData = dailyCourses;
   currentWeeklyData = weeklyDays;

   document.getElementById('tab_daily').classList.add('active');
   document.getElementById('tab_weekly').classList.remove('active');
   renderDailyMenu(dailyCourses);

   menuModal.classList.add('active');
};

/* renderöi päivän menu -> */

/* Helper function for normalizing diets data */
const normalizeDiets = (diets) => {
   if (!diets) return [];
   if (Array.isArray(diets)) return diets;
   if (typeof diets === 'string') {
      // Erotellaan pilkut, välilyönnit ja mahdolliset muut erottimet
      return diets.split(/[,; ]+/).filter((d) => d.trim().length > 0);
   }
   return [];
};

let currentDailyData = [];
let currentWeeklyData = [];

const renderDailyMenu = (courses) => {
   if (!courses || !Array.isArray(courses) || courses.length === 0) {
      menuModalBody.innerHTML = '<p class="menu-empty">Ei menua tänään</p>';
      return;
   }

   menuModalBody.innerHTML = courses
      .map((course) => {
         course.diets = normalizeDiets(course.diets);
         return `
    <div class="menu-item">
      <p class="menu-item-name">${course.name}</p>
      <p class="menu-item-price">${course.price}</p>
      <div class="menu-item-diets">
        ${course.diets.map((diet) => `<span class="diet-badge">${diet}</span>`).join('')}
      </div>
    </div>
  `;
      })
      .join('');
};

/* tab vaihto */
document.getElementById('tab_weekly').addEventListener('click', () => {
   document.getElementById('tab_weekly').classList.add('active');
   document.getElementById('tab_daily').classList.remove('active');
   renderWeeklyMenu(currentWeeklyData);
});

document.getElementById('tab_daily').addEventListener('click', () => {
   document.getElementById('tab_daily').classList.add('active');
   document.getElementById('tab_weekly').classList.remove('active');
   renderDailyMenu(currentDailyData);
});

/* sulje */
document.getElementById('menu_close').addEventListener('click', () => closeModal('menu'));
menuModal.addEventListener('click', (e) => {
   if (e.target === menuModal) closeModal('menu');
});
/* näytä kartalla menu-modalista */
document.getElementById('menu_show_map').addEventListener('click', () => {
   // Sulje menu-modal
   closeModal('menu');

   // Hae ravintolan nimi modalin otsikosta
   const restaurantName = document.getElementById('menu_modal_name').textContent;

   // Etsi ravintola listasta nimen perusteella
   const restaurant = allRestaurants.find((r) => r.name === restaurantName);

   if (restaurant && restaurant.location && restaurant.location.coordinates) {
      const [lon, lat] = restaurant.location.coordinates;
      map.setView([lat, lon], 16);
      const mapElement = document.getElementById('map');
      if (mapElement) {
         mapElement.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
   } else {
      console.error('Ravintolaa ei löytynyt kartalle:', restaurantName);
      // Vaihtoehtoinen toiminto: avaa google maps
      if (restaurant && restaurant.address) {
         const query = encodeURIComponent(`${restaurant.name} ${restaurant.address}`);
         window.open(`https://www.google.com/maps/search/${query}`, '_blank');
      }
   }
});

/* rendre weekly menu */
const renderWeeklyMenu = (days) => {
   if (!days || days.length === 0) {
      menuModalBody.innerHTML = '<p class="menu-empty">Ei viikon menua saatavilla</p>';
      return;
   }

   menuModalBody.innerHTML = days
      .map((day) => {
         // normalize diets for each course in the day
         day.courses = day.courses.map((course) => {
            course.diets = normalizeDiets(course.diets);
            return course;
         });
         return `
    <div class="menu-day">
      <p class="menu-day-title">${day.date}</p>
      ${day.courses
         .map(
            (course) => `
        <div class="menu-item">
          <p class="menu-item-name">${course.name.trim()}</p>
          ${course.price ? `<p class="menu-item-price">${course.price}</p>` : ''}
          <div class="menu-item-diets">
            ${course.diets.map((diet) => `<span class="diet-badge">${diet}</span>`).join('')}
          </div>
        </div>
      `
         )
         .join('')}
    </div>
  `;
      })
      .join('');
};

/* render all restaurant cards into the list */
const renderCards = async (restaurants, closestIdx = -1) => {
   const container = document.getElementById('restaurant_cards');
   if (!container) return;

   if (!restaurants || restaurants.length === 0) {
      container.innerHTML = '<p class="no-restaurants">Ei ravintoloita saatavilla</p>';
      return;
   }

   const totalPages = Math.ceil(restaurants.length / cardsPerPage);
   const start = (currentPage - 1) * cardsPerPage;
   const end = start + cardsPerPage;
   const pageRestaurants = restaurants.slice(start, end);

   container.innerHTML = '';

   /* odota että kaikki kortit on luotu */
   const cards = await Promise.all(pageRestaurants.map((rest, idx) => createCard(rest, start + idx === closestIdx)));

   cards.forEach((card) => container.appendChild(card));

   renderPagination(totalPages);
};

const renderPagination = (totalPages) => {
   /* poista vanha pagination jos on */
   const old = document.getElementById('pagination');
   if (old) old.remove();

   if (totalPages <= 1) return;

   const pagination = document.createElement('div');
   pagination.id = 'pagination';

   /* edellinen nappi */
   const prevBtn = document.createElement('button');
   prevBtn.textContent = '←';
   prevBtn.classList.add('page-btn');
   prevBtn.disabled = currentPage === 1;
   prevBtn.addEventListener('click', () => {
      currentPage--;
      renderCards(currentFilteredRestaurants || allRestaurants, closestIndex);
      window.scrollTo({top: document.getElementById('restaurant_cards').offsetTop - 20, behavior: 'smooth'});
   });

   /* sivunumero napit */
   const pages = document.createElement('div');
   pages.classList.add('page-numbers');

   for (let i = 1; i <= totalPages; i++) {
      /* näytä vain lähellä olevat sivut */
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
         const btn = document.createElement('button');
         btn.textContent = i;
         btn.classList.add('page-btn');
         if (i === currentPage) btn.classList.add('active');
         btn.addEventListener('click', () => {
            currentPage = i;
            renderCards(currentFilteredRestaurants || allRestaurants, closestIndex);
            window.scrollTo({top: document.getElementById('restaurant_cards').offsetTop - 20, behavior: 'smooth'});
         });
         pages.appendChild(btn);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
         /* lisää ... välit */
         const dots = document.createElement('span');
         dots.textContent = '...';
         dots.classList.add('page-dots');
         pages.appendChild(dots);
      }
   }

   /* seuraava nappi */
   const nextBtn = document.createElement('button');
   nextBtn.textContent = '→';
   nextBtn.classList.add('page-btn');
   nextBtn.disabled = currentPage === totalPages;
   nextBtn.addEventListener('click', () => {
      currentPage++;
      renderCards(currentFilteredRestaurants || allRestaurants, closestIndex);
      window.scrollTo({top: document.getElementById('restaurant_cards').offsetTop - 20, behavior: 'smooth'});
   });

   pagination.appendChild(prevBtn);
   pagination.appendChild(pages);
   pagination.appendChild(nextBtn);

   /* lisää pagination korttien jälkeen */
   document.getElementById('restaurant_cards').after(pagination);
};

// expose function globally and keep old misspelled name for compatibility
window.renderCards = renderCards;
window.rendreCards = renderCards;
