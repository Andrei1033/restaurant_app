const API_BASE_URL = "https://media2.edu.metropolia.fi/restaurant/api/v1";

/* get all restaurants */
const getRestaurants = async () => {
   try {
      const response = await fetch(`${API_BASE_URL}/restaurants`);
      const data = await response.json();
      return data;
   }
   catch (error) {
      console.error("Error fetching restaurants:", error);
      return [];
   }
};

/* get daily menu*/
const getDailyMenu = async (id, lang = "fi") => {
   try {
      const response = await fetch(`${API_BASE_URL}/restaurants/daily/${id}/${lang}`);
      const data = await response.json();
      return data.courses || [];
   }
   catch (error) {
      console.error(`Error fetching daily menu for restaurant ${id}:`, error);
      return [];
   }
};

/* get weekly menu */
const getWeeklyMenu = async (id, lang = "fi") => {
   try {
      const response = await fetch(`${API_BASE_URL}/restaurants/weekly/${id}/${lang}`);
      const data = await response.json();
      return Array.isArray(data) ? data : data.days || [];
   }
   catch (error) {
      console.error(`Error fetching weekly menu for restaurant ${id}:`, error);
      return [];
   }
};
