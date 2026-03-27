/* language select */
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

// filters
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

/* add to favourites */
const favouriteBtns = document.querySelectorAll('.card_favourite');

favouriteBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
  });
});


/* modal logiikka */
const modals = {
  login: document.getElementById('login_modal'),
  register: document.getElementById('register_modal'),
  profile: document.getElementById('profile_modal'),
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
const openMenuModal = (restaurantName, isClosest, isFavourite, courses) => {
  menuModalName.textContent = restaurantName;

  // lähin badge
  menuModalClosest.style.display = isClosest ? 'inline-block' : 'none';

  // sydän
  if (isFavourite) {
    menuModalFavourite.classList.add('active');
  } else {
    menuModalFavourite.classList.remove('active');
  }

  // täytä menu lista
  renderDailyMenu(courses);

  menuModal.classList.add('active');
};

/* renderöi päivän menu */
const renderDailyMenu = (courses) => {
  if (!courses || courses.length === 0) {
    menuModalBody.innerHTML = '<p class="menu-empty">Ei menua tänään</p>';
    return;
  }

  menuModalBody.innerHTML = courses.map(course => `
    <div class="menu-item">
      <p class="menu-item-name">${course.name}</p>
      <p class="menu-item-price">${course.price}</p>
      <div class="menu-item-diets">
        ${course.diets.map(diet => `<span class="diet-badge">${diet}</span>`).join('')}
      </div>
    </div>
  `).join('');
};

/* tab vaihto */
document.getElementById('tab_daily').addEventListener('click', () => {
  document.getElementById('tab_daily').classList.add('active');
  document.getElementById('tab_weekly').classList.remove('active');
  // myöhemmin: hae päivän data API:sta
});

document.getElementById('tab_weekly').addEventListener('click', () => {
  document.getElementById('tab_weekly').classList.add('active');
  document.getElementById('tab_daily').classList.remove('active');
  // myöhemmin: hae viikon data API:sta
});

/* sulje */
document.getElementById('menu_close').addEventListener('click', () => closeModal('menu'));
menuModal.addEventListener('click', (e) => {
  if (e.target === menuModal) closeModal('menu');
});

/* sydän toggle modalissa */
menuModalFavourite.addEventListener('click', () => {
  menuModalFavourite.classList.toggle('active');
});

/* testaa modalia — POISTA kun API kytketään */
document.querySelectorAll('.card_show_menu').forEach(btn => {
  btn.addEventListener('click', () => {
    const testData = [
      { name: "Pariloitu broilerinfilee", price: "Opiskelija 2.90 € / henkilökunta 8.23 €", diets: ["G", "L", "M"] },
      { name: "Falafelia", price: "Opiskelija 2.90 € / henkilökunta 8.23 €", diets: ["G", "ILM", "L", "Veg", "VS"] },
      { name: "Perunamuusia", price: "Opiskelija 2.90 € / henkilökunta 8.23 €", diets: ["*", "A", "G", "L"] },
    ];
    openMenuModal('Ravintola 1', true, false, testData);
  });
});












































