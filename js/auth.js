const API_BASE_URL = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

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
            'Authorization': `Bearer ${token}`
         }
      });

      if (!response.ok) {
         removeToken();
         return null;
      }

      const user = await response.json();
      return user;
   }
   catch (error) {
      console.error('Error checking token:', error);
      return null;
   }
};

// kirjaudu sisään
const login = async (email, password) => {
   try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
         return { success: false, message: data.message || 'Kirjautuminen epäonnistui' };
      }

      saveToken(data.token);
      return { success: true, user: data.data };
   }
   catch (error) {
      console.error('Error logging in:', error);
      return { success: false, message: 'Kirjautuminen epäonnistui' };
   }
};

// kirjaudu ulos
const logout = () => {
   removeToken();
   updateHeaderUI(null);
};

