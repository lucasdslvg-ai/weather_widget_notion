// ==============================
// CONFIGURATION - Remplace TA_CLE_API_ICI par ta clé OpenWeatherMap
// ==============================
const API_KEY = "fa182a192b3cd7f3af1541b8c64daeab"; // <-- Remplace par ta clé
const CITY = "Geneva";
const LANG = "fr"; // "fr" pour descriptions en français
const UNITS = "metric"; // Celsius
const API_URL_CURRENT = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=${UNITS}&lang=${LANG}&appid=${API_KEY}`;
const API_URL_FORECAST = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=${UNITS}&lang=${LANG}&appid=${API_KEY}`;

const skycons = new Skycons({ color: "white" });

// ==============================
// Convertit texte API -> icône Skycons
// ==============================
function setWeatherIcon(canvasId, description) {
    let iconType = Skycons.CLEAR_DAY;
    if (description.includes("cloud")) iconType = Skycons.PARTLY_CLOUDY_DAY;
    if (description.includes("rain")) iconType = Skycons.RAIN;
    if (description.includes("snow")) iconType = Skycons.SNOW;
    if (description.includes("thunderstorm")) iconType = Skycons.SLEET;
    if (description.includes("mist") || description.includes("fog")) iconType = Skycons.FOG;
    if (description.includes("clear")) iconType = Skycons.CLEAR_DAY;
    skycons.add(canvasId, iconType);
}

fetch(API_URL_CURRENT)
    .then(res => res.json())
    .then(data => {
        document.getElementById("temp-current").textContent = Math.round(data.main.temp);
        document.getElementById("desc-current").textContent = data.weather[0].description;
        setWeatherIcon("icon-current", data.weather[0].description.toLowerCase());
        skycons.play();
    });

fetch(API_URL_FORECAST)
    .then(res => res.json())
    .then(data => {
        const days = {};
        data.list.forEach(item => {
            const date = new Date(item.dt_txt);
            const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
            if (!days[dayName]) days[dayName] = item;
        });
        const keys = Object.keys(days).slice(1, 4);
        keys.forEach((dayName, i) => {
            document.getElementById(`day${i+1}-name`).textContent = dayName;
            document.getElementById(`day${i+1}-max`).textContent = `${Math.round(days[dayName].main.temp_max)} °C`;
            document.getElementById(`day${i+1}-min`).textContent = `${Math.round(days[dayName].main.temp_min)} °C`;
            setWeatherIcon(`icon-day${i+1}`, days[dayName].weather[0].description.toLowerCase());
        });
        skycons.play();
    });
