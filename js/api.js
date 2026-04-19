const API_BASE_URL = 'https://media2.edu.metropolia.fi/restaurant/api/v1';

// get all restaurants
const getRestaurants = async () => {
   try {
      const response = await fetch(`${API_BASE_URL}/restaurants`);
      const data = await response.json();
      return data;
   } catch (error) {
      console.error('Error fetching restaurants:', error);
      return [];
   }
};

// get daily menu
const getDailyMenu = async (id, lang = 'fi') => {
   try {
      const response = await fetch(`${API_BASE_URL}/restaurants/daily/${id}/${lang}`);
      const data = await response.json();
      return data.courses || [];
   } catch (error) {
      console.error(`Error fetching daily menu for restaurant ${id}:`, error);
      return [];
   }
};

// get weekly menu
const getWeeklyMenu = async (id, lang = 'fi') => {
   try {
      const response = await fetch(`${API_BASE_URL}/restaurants/weekly/${id}/${lang}`);
      const data = await response.json();
      return Array.isArray(data) ? data : data.days || [];
   } catch (error) {
      console.error(`Error fetching weekly menu for restaurant ${id}:`, error);
      return [];
   }
};

// Hae käyttäjän profiilitiedot
const getUserProfile = async () => {
   const token = getToken();
   if (!token) return null;

   try {
      const response = await fetch(`${API_BASE_URL}/users/token`, {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });

      if (!response.ok) return null;
      return await response.json();
   } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
   }
};

// Päivitä käyttäjän tiedot
const updateUserProfile = async (userData) => {
   const token = getToken();
   if (!token) return {success: false, message: 'Ei kirjautumistokenia'};

   try {
      const response = await fetch(`${API_BASE_URL}/users`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) {
         return {success: false, message: data.message || 'Päivitys epäonnistui'};
      }
      return {success: true, user: data};
   } catch (error) {
      console.error('Error updating profile:', error);
      return {success: false, message: 'Verkkovirhe, yritä uudelleen'};
   }
};

// Lataa profiilikuva
const uploadAvatar = async (file) => {
   const token = getToken();
   if (!token) return {success: false, message: 'Ei kirjautumistokenia'};

   const formData = new FormData();
   formData.append('avatar', file);

   try {
      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
         method: 'POST',
         headers: {
            Authorization: `Bearer ${token}`,
         },
         body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
         return {success: false, message: data.message || 'Kuvan lataus epäonnistui'};
      }
      return {success: true, avatarUrl: data.avatar};
   } catch (error) {
      console.error('Error uploading avatar:', error);
      return {success: false, message: 'Verkkovirhe, yritä uudelleen'};
   }
};
