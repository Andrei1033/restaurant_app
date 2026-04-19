//tallenna token
const saveToken = (token) => {
   localStorage.setItem('token', token);
};

// hae token
const getToken = () => {
   return localStorage.getItem('token');
};

// poista token
const removeToken = () => {
   localStorage.removeItem('token');
};

// tarkista token ja hae käyttäjän tiedot
const checkToken = async () => {
   const token = getToken();
   if (!token) return null;
   try {
      const response = await fetch(`${API_BASE_URL}/users/token`, {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });

      if (!response.ok) {
         removeToken();
         return null;
      }

      const user = await response.json();
      return user;
   } catch (error) {
      console.error('Error checking token:', error);
      return null;
   }
};

// kirjaudu sisään
// Accept either username or email from the UI (identifier)
const login = async (identifier, password) => {
   try {
      // send username field because the backend expects `username` when registering
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({username: identifier, password}),
      });

      const data = await response.json();

      if (!response.ok) {
         return {success: false, message: data.message || 'Kirjautuminen epäonnistui'};
      }

      // Support multiple possible response shapes
      const token = data.token || data.data?.token || data.accessToken || data.access_token;
      const user = data.user || data.data?.user || data.data || data;

      if (token) saveToken(token);

      return {success: true, user};
   } catch (error) {
      console.error('Error logging in:', error);
      return {success: false, message: 'Kirjautuminen epäonnistui'};
   }
};

// registration
const register = async (username, email, password) => {
   try {
      // API expects `username` field when creating users
      const response = await fetch(`${API_BASE_URL}/users`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({username, email, password}),
      });

      const data = await response.json();
      console.log('API vastaus:', data);

      if (!response.ok) {
         return {success: false, message: data.message || 'Rekisteröinti epäonnistui'};
      }

      // After successful registration, log the user in using the username
      const loginResult = await login(username, password);
      return loginResult;
   } catch (error) {
      console.error('Rekisteröintivirhe:', error);
      return {success: false, message: 'Verkkovirhe, yritä uudelleen'};
   }
};

document.getElementById('register_submit').addEventListener('click', async () => {
   const username = document.getElementById('register_username').value;
   const email = document.getElementById('register_email').value;
   const password = document.getElementById('register_password').value;
   const errorEl = document.getElementById('register_error');

   if (!username || !email || !password) {
      errorEl.textContent = 'Täytä kaikki kentät';
      return;
   }

   const result = await register(username, email, password);

   if (result.success) {
      updateHeaderUI(result.user);
      closeModal('register');
      errorEl.textContent = '';
   } else {
      errorEl.textContent = result.message;
   }
});

// kirjaudu ulos
const logout = () => {
   removeToken();
   updateHeaderUI(null);

   // Sulje kaikki modaalit
   const modals = ['login', 'register', 'profile', 'menu', 'confirm_modal'];
   modals.forEach((modal) => {
      const modalEl = document.getElementById(`${modal}_modal`);
      if (modalEl) modalEl.classList.remove('active');
   });

   // Tyhjennä profiilimodaalin kentät
   const profileUsername = document.getElementById('profile_username');
   const profileEmail = document.getElementById('profile_email');
   const profilePassword = document.getElementById('profile_password');
   if (profileUsername) profileUsername.value = '';
   if (profileEmail) profileEmail.value = '';
   if (profilePassword) profilePassword.value = '';

   // Näytä notifikaatio
   showNotification('Olet kirjautunut ulos', 'success');
};

// logout-nappi
document.getElementById('logout_button').addEventListener('click', () => {
   logout();
   closeModal('profile');
});
