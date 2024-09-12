const apiKey = 'a9405bfd688989bd368b6d90f329b01c'; // Temporarily store it here, but avoid committing it to public repos // Replace with your OpenWeatherMap API key

// DOM elements
const cityInput = document.getElementById('city-input');
const searchForm = document.getElementById('search-form');
const currentDetails = document.getElementById('current-details');
const forecastDetails = document.getElementById('forecast-details');
const historyList = document.getElementById('history-list');

// Fetch geographical coordinates by city name
const getCityCoordinates = async (cityName) => {
  const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`);
  const data = await response.json();
  return data[0]; // Contains latitude and longitude
};

// Fetch weather data based on coordinates
const getWeatherData = async (lat, lon) => {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  return data;
};

// Display current weather
const displayCurrentWeather = (data) => {
  const weather = data.list[0];
  const currentHTML = `
    <p>City: ${data.city.name}</p>
    <p>Date: ${new Date(weather.dt * 1000).toLocaleDateString()}</p>
    <p>Temperature: ${weather.main.temp}°C</p>
    <p>Humidity: ${weather.main.humidity}%</p>
    <p>Wind Speed: ${weather.wind.speed} m/s</p>
    <img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png" alt="${weather.weather[0].description}">
  `;
  currentDetails.innerHTML = currentHTML;
};

// Display 5-day forecast
const displayForecast = (data) => {
  forecastDetails.innerHTML = ''; // Clear previous data
  const forecastHTML = data.list.filter((_, idx) => idx % 8 === 0).map((forecast) => {
    return `
      <div class="forecast-item">
        <p>Date: ${new Date(forecast.dt * 1000).toLocaleDateString()}</p>
        <p>Temp: ${forecast.main.temp}°C</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
        <p>Wind: ${forecast.wind.speed} m/s</p>
        <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
      </div>
    `;
  }).join('');
  forecastDetails.innerHTML = forecastHTML;
};

// Save to search history
const saveToSearchHistory = (cityName) => {
  let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!history.includes(cityName)) {
    history.push(cityName);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    renderSearchHistory();
  }
};

// Render search history
const renderSearchHistory = () => {
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  historyList.innerHTML = history.map(city => `<li><button class="history-btn">${city}</button></li>`).join('');
};

// Handle search form submission
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cityName = cityInput.value.trim();
  if (!cityName) return;

  const coordinates = await getCityCoordinates(cityName);
  if (!coordinates) {
    alert('City not found');
    return;
  }

  const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
  displayCurrentWeather(weatherData);
  displayForecast(weatherData);
  saveToSearchHistory(cityName);
  cityInput.value = '';
});

// Handle search history click
historyList.addEventListener('click', async (e) => {
  if (!e.target.matches('.history-btn')) return;

  const cityName = e.target.textContent;
  const coordinates = await getCityCoordinates(cityName);
  const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
  displayCurrentWeather(weatherData);
  displayForecast(weatherData);
});

// Initialize
renderSearchHistory();