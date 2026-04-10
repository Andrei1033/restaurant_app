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

// filters dropdown
const customSelects = document.querySelectorAll('.custom-select');

customSelects.forEach(select => {
  const selected = select.querySelector('.select-selected');
  const items = select.querySelector('.select-items');

  selected.addEventListener('click', () => {
    const isOpen = !items.classList.contains('select-hide');

    // sulje kaikki muut ensin
    customSelects.forEach(s => {
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
      // poista selected kaikilta
      items.querySelectorAll('div').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      selected.textContent = item.textContent;
      items.classList.add('select-hide');
      select.classList.remove('open');
    });
  });
});

// sulje jos klikataan muualle
document.addEventListener('click', (e) => {
  customSelects.forEach(select => {
    if (!select.contains(e.target)) {
      select.querySelector('.select-items').classList.add('select-hide');
      select.classList.remove('open');
    }
  });
});

/* generate one card by api data*/
const createCard = (restaurant, isClosest) => {
  const card = document.createElement('div');
  card.classList.add('card');
   card.dataset.id = restaurant._id;
   card.dataset.city = restaurant.city;
   card.dataset.company = restaurant.company;

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
         <button class="card_show_menu">Näytä valikko</button>
         <button class="card_show_map">Näytä kartta</button>
      </div>
   `;

   /* favourite button */
   card.querySelector('.card_favourite').addEventListener('click', (e) => {
      e.currentTarget.classList.toggle('active');
   });

   /* show menu */
   card.querySelector('.card_show_menu').addEventListener('click', async () => {
      const dailyCourses = await getDailyMenu(restaurant._id, currentLang);
      const weeklyDays = await getWeeklyMenu(restaurant._id, currentLang);
      openMenuModal(restaurant.name, isClosest, false, dailyCourses, weeklyDays);
   });

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
const renderCards = (restaurants, closestIdx = -1) => {
  const container = document.getElementById('restaurant_cards');
  if (!container) return;
  container.innerHTML = '';

  if (!restaurants || restaurants.length === 0) {
    container.innerHTML = '<p class="no-restaurants">Ei ravintoloita saatavilla</p>';
    return;
  }

  restaurants.forEach((rest, idx) => {
    const isClosest = idx === closestIdx;
    const card = createCard(rest, isClosest);
    container.appendChild(card);
  });
};

// expose function globally and keep old misspelled name for compatibility
window.renderCards = renderCards;
window.rendreCards = renderCards;
