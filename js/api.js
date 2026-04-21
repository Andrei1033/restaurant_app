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

// Fetch user profile
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

// Update user profile
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
         // Return backend error message or a generic one
         let errorMessage = data.message || 'Update failed';

         // If backend returns MongoDB duplicate key error, keep the message
         if (data.message && data.message.includes('E11000')) {
            errorMessage = data.message;
         }

         return {success: false, message: errorMessage};
      }

      return {success: true, user: data};
   } catch (error) {
      console.error('Error updating profile:', error);
      return {success: false, message: 'Network error, please try again'};
   }
};

// Upload avatar
const uploadAvatar = async (file) => {
   const token = getToken();
   if (!token) return {success: false, message: 'No auth token'};

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
         return {success: false, message: data.message || 'Avatar upload failed'};
      }
      return {success: true, avatarUrl: data.avatar};
   } catch (error) {
      console.error('Error uploading avatar:', error);
      return {success: false, message: 'Network error, please try again'};
   }
};

// Delete user account
const deleteUserAccount = async () => {
   const token = getToken();
   if (!token) return {success: false, message: 'No auth token'};

   try {
      const response = await fetch(`${API_BASE_URL}/users`, {
         method: 'DELETE',
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });

      if (!response.ok) {
         const data = await response.json();
         return {success: false, message: data.message || 'Account deletion failed'};
      }

      // Poista token ja tee logout
      removeToken();
      updateHeaderUI(null);

      return {success: true, message: 'Account deleted successfully'};
   } catch (error) {
      console.error('Error deleting account:', error);
      return {success: false, message: 'Network error, please try again'};
   }
};

// Update user's favourite restaurant
const updateFavouriteRestaurant = async (restaurantId) => {
   const token = getToken();
   if (!token) return {success: false, message: 'Login required to set favourites'};

   try {
      const response = await fetch(`${API_BASE_URL}/users`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({favouriteRestaurant: restaurantId}),
      });

      const data = await response.json();

      if (!response.ok) {
         return {success: false, message: data.message || 'Failed to update favourite'};
      }

      return {success: true, user: data};
   } catch (error) {
      console.error('Error updating favourite:', error);
      return {success: false, message: 'Network error, please try again'};
   }
};

// Remove favourite (set to null)
const removeFavouriteRestaurant = async () => {
   const token = getToken();
   if (!token) return {success: false, message: 'Login required'};

   try {
      const response = await fetch(`${API_BASE_URL}/users`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({favouriteRestaurant: null}),
      });

      const data = await response.json();

      if (!response.ok) {
         return {success: false, message: data.message || 'Failed to remove favourite'};
      }

      return {success: true, user: data};
   } catch (error) {
      console.error('Error removing favourite:', error);
      return {success: false, message: 'Network error, please try again'};
   }
};

// Fetch user's current favourite
const getUserFavourite = async () => {
   const user = await getUserProfile();
   if (!user) return null;
   return user.favouriteRestaurant || null;
};
