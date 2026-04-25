# Student Restaurant Compass

A web application for browsing Finnish student restaurants, their daily and weekly menus, and locations on a map.

**Live Demo:** https://users.metropolia.fi/~andreits/restaurant_app/html/

---

## Features

- Interactive map showing all restaurants with your nearest one highlighted
- Daily and weekly menus for each restaurant
- Filter restaurants by city, company, or search by name
- Save your favourite restaurant (requires login)
- User registration, login and profile management
- Profile picture upload
- Finnish and English language support
- Fully responsive design

---

## Technologies

- **Vanilla JavaScript** (ES6+) — no frameworks
- **CSS3** — custom styling, no CSS frameworks
- **Leaflet.js** — interactive map
- **OpenStreetMap** — map tiles

---

## API

This project uses the Metropolia Student Restaurants REST API.

Base URL: `https://media2.edu.metropolia.fi/restaurant/api/v1`

Key endpoints used:

- `GET /restaurants` — fetch all restaurants
- `GET /restaurants/daily/:id/:lang` — daily menu
- `GET /restaurants/weekly/:id/:lang` — weekly menu
- `POST /auth/login` — user login
- `POST /users` — register new user
- `PUT /users` — update user profile
- `POST /users/avatar` — upload profile picture

Full API documentation: https://media2.edu.metropolia.fi/restaurant/

---

## Project Structure
