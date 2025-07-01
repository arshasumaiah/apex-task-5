const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-card");

const API_KEY = "2ce8c578202bc2004604c3671ba05ffd";

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    return `
      <div class="details">
        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
        <h4>Temperature: ${weatherItem.main.temp}°C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>${weatherItem.weather[0].description}</h4>
      </div>
    `;
  } else {
    return `
      <li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temp: ${weatherItem.main.temp}°C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
      </li>
    `;
  }
};

const updateCurrentWeather = (cityName, weatherItem) => {
  currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, 0);
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then(res => res.json())
    .then(data => {
      const uniqueForecastDays = [];
      const fiveDayForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          uniqueForecastDays.push(forecastDate);
          return true;
        }
        return false;
      });

      updateCurrentWeather(cityName, data.list[0]);
      weatherCardsDiv.innerHTML = "";

      fiveDayForecast.forEach((weatherItem, index) => {
        weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;

  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return alert(`No coordinates found for "${cityName}"`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      fetch(REVERSE_GEOCODING_URL)
        .then(res => res.json())
        .then(data => {
          if (!data.length) return alert("Could not fetch city name from your location.");
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city from your location!");
        });
    },
    error => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please allow access to location.");
      }
    }
  );
};

searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());