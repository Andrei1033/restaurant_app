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

const btn = document.getElementById('card_1_favourite');

btn.addEventListener('click', () => {
  btn.classList.toggle('active');
});
