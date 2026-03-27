const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   noWrap: true,
   attribution: '&copy; OpenStreetMap',
   maxBoundsViscosity: 1.0,
   bounds: [[-90, -180], [90, 180]]
}).addTo(map);
