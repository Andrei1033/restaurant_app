let activeFilters = {
   city: "",
   company: "",
   search: "",
   favourite: false
};
let currentFilteredRestaurants = null;

/* language select ui*/
const langBtns = document.querySelectorAll('.lang-btn');

langBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    langBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const lang = btn.dataset.lang;
    console.log('Kieli vaihdettu:', lang);
    // myöhemmin tähän API-kutsu oikealla kielellä
  });
});

/* filters*/
const applyFilters = () => {
   let filtered = [...allRestaurants];

   /* kaupunki filtteri */
   if (activeFilters.city) {
      filtered = filtered.filter(r =>
         r.city?.toLowerCase() === activeFilters.city.toLowerCase());
   }

   /* yritys filtteri */
   if (activeFilters.company) {
      filtered = filtered.filter(r =>
         r.company?.toLowerCase() === activeFilters.company.toLowerCase());
   }

   /* hakukenttä — nimi tai osoite */
   if (activeFilters.search) {
      const search = activeFilters.search.toLowerCase();
      filtered = filtered.filter(r =>
         r.name?.toLowerCase().includes(search) ||
         r.address?.toLowerCase().includes(search) ||
         r.city?.toLowerCase().includes(search)
      );
   }

  /* suosikit — tullee myöhemmin kun kirjautuminen on valmis */
  /* if (activeFilters.favourites) {
    filtered = filtered.filter(r => r._id === userFavouriteId);
  } */

   /* render cards */
   currentFilteredRestaurants = filtered;
   currentPage = 1;
   renderCards(filtered, closestIndex);
};


// filters dropdown
const initDropdownListeners = () => {
  document.querySelectorAll('.custom-select').forEach(select => {
    const selected = select.querySelector('.select-selected');
    const items = select.querySelector('.select-items');

    const newSelected = selected.cloneNode(true);
    selected.parentNode.replaceChild(newSelected, selected);

    newSelected.addEventListener('click', () => {
      const isOpen = !items.classList.contains('select-hide');
      document.querySelectorAll('.custom-select').forEach(s => {
        s.querySelector('.select-items').classList.add('select-hide');
        s.classList.remove('open');
      });
      if (!isOpen) {
        items.classList.remove('select-hide');
        select.classList.add('open');
      }
    });

    items.querySelectorAll('div').forEach(item => {
      item.addEventListener('click', () => {
        items.querySelectorAll('div').forEach(i => i.classList.remove('selected'));
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
    document.querySelectorAll('.custom-select').forEach(select => {
      if (!select.contains(e.target)) {
        select.querySelector('.select-items').classList.add('select-hide');
        select.classList.remove('open');
      }
    });
  });
};

/* alusta heti sivun latautuessa */
initDropdownListeners();

// sulje jos klikataan muualle
document.addEventListener('click', (e) => {
  customSelects.forEach(select => {
    if (!select.contains(e.target)) {
      select.querySelector('.select-items').classList.add('select-hide');
      select.classList.remove('open');
    }
  });
});

/* hakukenttä */
const searchInput = document.getElementById('search_input');
   searchInput.addEventListener('input', (e) => {
      activeFilters.search = e.target.value.trim();
      applyFilters();
});

/* suosikit nappi */
document.getElementById('favourites_button').addEventListener('click', () => {
   activeFilters.favourites = !activeFilters.favourites;
   document.getElementById('favourites_button').classList.toggle('active', activeFilters.favourites);
   applyFilters();
});

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
   const hasWeekly  = weeklyDays && weeklyDays.length > 0;
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
   card.querySelector('.card_favourite').addEventListener('click', (e) => {
      e.currentTarget.classList.toggle('active');
   });

   /* show menu */
   if (hasMenu) {
      card.querySelector('.card_show_menu').addEventListener('click', async () => {
         const weeklyDays = await getWeeklyMenu(restaurant._id, currentLang);
         openMenuModal(restaurant.name, isClosest, false, dailyCourses, weeklyDays);
      });
   }

  /* show on map */
  card.querySelector('.card_show_map').addEventListener('click', () => {
    const [lon, lat] = restaurant.location.coordinates;
    map.setView([lat, lon], 16);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  modals[name].classList.add('active');
};

const closeModal = (name) => {
  modals[name].classList.remove('active');
};

/* avaa modalit napeista */
document.getElementById('login_button').addEventListener('click', () => openModal('login'));
document.getElementById('register_button').addEventListener('click', () => openModal('register'));
document.getElementById('user_profile').addEventListener('click', () => openModal('profile'));

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

/* avaa menu modal — myöhemmin kutsutaan API-datalla */
const openMenuModal = (restaurantName, isClosest, isFavourite, dailyCourses, weeklyDays) => {
  menuModalName.textContent = restaurantName;
  menuModalClosest.style.display = isClosest ? 'inline-block' : 'none';

  if (isFavourite) {
    menuModalFavourite.classList.add('active');
  } else {
    menuModalFavourite.classList.remove('active');
  }

  // tallenna data tab-vaihtoa varten
  currentDailyData = dailyCourses;
  currentWeeklyData = weeklyDays;

  // näytä päivän menu oletuksena
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
    return diets.split(/[,; ]+/).filter(d => d.trim().length > 0);
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

  menuModalBody.innerHTML = courses.map(course => {
    course.diets = normalizeDiets(course.diets);
    return `
    <div class="menu-item">
      <p class="menu-item-name">${course.name}</p>
      <p class="menu-item-price">${course.price}</p>
      <div class="menu-item-diets">
        ${course.diets.map(diet => `<span class="diet-badge">${diet}</span>`).join('')}
      </div>
    </div>
  `;
  }).join('');
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
   const restaurant = allRestaurants.find(r => r.name === restaurantName);

   if (restaurant && restaurant.location && restaurant.location.coordinates) {
      const [lon, lat] = restaurant.location.coordinates;
      map.setView([lat, lon], 16);
      const mapElement = document.getElementById('map');
      if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
   }
   else {
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

  menuModalBody.innerHTML = days.map(day => {
   // normalize diets for each course in the day
   day.courses = day.courses.map(course => {
     course.diets = normalizeDiets(course.diets);
     return course;
   });
   return `
    <div class="menu-day">
      <p class="menu-day-title">${day.date}</p>
      ${day.courses.map(course => `
        <div class="menu-item">
          <p class="menu-item-name">${course.name.trim()}</p>
          ${course.price ? `<p class="menu-item-price">${course.price}</p>` : ''}
          <div class="menu-item-diets">
            ${course.diets.map(diet => `<span class="diet-badge">${diet}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  }).join('');
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
  const cards = await Promise.all(
    pageRestaurants.map((rest, idx) => createCard(rest, (start + idx) === closestIdx))
  );

  cards.forEach(card => container.appendChild(card));

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
   window.scrollTo({ top: document.getElementById('restaurant_cards').offsetTop - 20, behavior: 'smooth' });
   });

   /* sivunumero napit */
   const pages = document.createElement('div');
   pages.classList.add('page-numbers');

   for (let i = 1; i <= totalPages; i++) {
      /* näytä vain lähellä olevat sivut */
      if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.classList.add('page-btn');
      if (i === currentPage) btn.classList.add('active');
      btn.addEventListener('click', () => {
         currentPage = i;
         renderCards(currentFilteredRestaurants || allRestaurants, closestIndex);
         window.scrollTo({ top: document.getElementById('restaurant_cards').offsetTop - 20, behavior: 'smooth' });
      });
      pages.appendChild(btn);
      } else if (
      i === currentPage - 2 ||
      i === currentPage + 2
      ) {
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
      window.scrollTo({ top: document.getElementById('restaurant_cards').offsetTop - 20, behavior: 'smooth' });
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
