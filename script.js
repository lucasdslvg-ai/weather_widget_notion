// ==============================
// CONFIGURATION - Remplace TA_CLE_API_ICI par ta clé OpenWeatherMap
// ==============================
const API_KEY = "fa182a192b3cd7f3af1541b8c64daeab"; // <-- Remplace par ta clé
const CITY = "Geneva";
const UNITS = "metric"; // Celsius
const LANG = "fr"; // "fr" pour descriptions en français

const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=${UNITS}&lang=${LANG}&appid=${API_KEY}`;

// ==============================
// Convertit texte API -> icône Skycons
// ==============================
function getSkyconType(weather) {
    if (!weather) return Skycons.CLOUDY;
    weather = weather.toLowerCase();

    if (weather.includes('clear')) return Skycons.CLEAR_DAY;
    if (weather.includes('cloud')) return Skycons.CLOUDY;
    if (weather.includes('rain') || weather.includes('drizzle')) return Skycons.RAIN;
    if (weather.includes('thunder')) return Skycons.RAIN; // pas d'orage dédié dans Skycons
    if (weather.includes('snow') || weather.includes('sleet')) return Skycons.SNOW;
    if (weather.includes('mist') || weather.includes('fog') || weather.includes('haze')) return Skycons.FOG;
    if (weather.includes('wind')) return Skycons.WIND;

    return Skycons.CLOUDY;
}

// ==============================
// Animation fade-in utilitaire
// ==============================
function fadeInElement(el) {
    if (!el) return;
    el.style.opacity = 0;
    el.style.transform = 'translateY(6px)';
    // trigger reflow
    void el.offsetWidth;
    el.style.opacity = 1;
    el.style.transform = 'translateY(0)';
}

// ==============================
// Récupération et insertion des données
// ==============================
async function loadWeather(){
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Réponse API non OK: ' + res.status);
        const data = await res.json();
        console.log('OpenWeatherMap response', data);

        // Skycons
        const skycons = new Skycons({ color: '#1f2937' });

        // Données "actuelles" (on prend la première entrée disponible)
        const now = data.list[0];
        const temp = Math.round(now.main.temp);
        const desc = now.weather[0].description;
        const main = now.weather[0].main;

        document.querySelector('.temperature').textContent = `${temp}°C`;
        document.querySelector('.description').textContent = desc;

        // ajouter icône principale (premier canvas)
        const canvases = document.querySelectorAll('.weather-icon');
        if (canvases.length > 0) {
            skycons.add(canvases[0], getSkyconType(main));
        }

        // Prévisions - on prend les index 8,16,24 (24h,48h,72h plus tard)
        const days = document.querySelectorAll('.day');
        for (let i = 1; i <= 3; i++) {
            const idx = i * 8;
            if (!data.list[idx]) continue;
            const item = data.list[idx];
            const max = Math.round(item.main.temp_max);
            const min = Math.round(item.main.temp_min);
            const mainW = item.weather[0].main;

            const dayEl = days[i - 1];
            if (!dayEl) continue;

            const pAll = dayEl.querySelectorAll('p');
            // pAll[0] -> nom du jour (garde celui par défaut dans le HTML)
            pAll[1].textContent = `${max}°C`;
            pAll[2].textContent = `${min}°C`;

            // ajouter icône pour la prévision (canvas à l'intérieur du .day)
            const canvas = dayEl.querySelector('.weather-icon');
            if (canvas) skycons.add(canvas, getSkyconType(mainW));

            // reveal via CSS transition
            dayEl.style.opacity = 1;
            dayEl.style.transform = 'translateY(0)';
        }

        // jouer Skycons
        skycons.play();

        // fade-in current weather
        fadeInElement(document.querySelector('.current-weather'));

    } catch (err) {
        console.error('Erreur chargement météo:', err);
        document.querySelector('.description').textContent = 'Erreur de chargement';
    }
}

// Lancer au chargement
loadWeather();

// NOTE:
// - Pour tester localement sans clé, tu peux utiliser un mock JSON et remplacer fetch par lecture locale.
// - Pour Notion : héberge le projet (GitHub Pages / Netlify) et utilise l'URL publique dans un bloc "Embed".
