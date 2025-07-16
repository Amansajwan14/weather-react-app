import React, { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeView, setActiveView] = useState('current'); 

  const API_KEY = "895284fb2d2c50a520ea537456963d9c";
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${API_KEY}`;
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${API_KEY}`;

  
  const fetchSuggestions = async (query) => {
    if (query.length > 2) {
      try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`);
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  
  const fetchAQI = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      const data = await response.json();
      setAqi(data);
    } catch (error) {
      console.error("Error fetching AQI data:", error);
    }
  };

  
  const processForecastData = (forecastData) => {
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          weather: item.weather[0],
          humidity: item.main.humidity,
          wind_speed: item.wind.speed
        };
      } else {
        dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, item.main.temp_min);
        dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, item.main.temp_max);
      }
    });
    
    return Object.values(dailyForecasts).slice(0, 7);
  };

  const performSearch = async (searchLocation = location) => {
    if (searchLocation.trim()) {
      try {
        
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchLocation}&units=metric&appid=${API_KEY}`);
        const currentData = await currentResponse.json();
        
        if (currentData.cod === 200) {
          setData(currentData);
          
          
          const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchLocation}&units=metric&appid=${API_KEY}`);
          const forecastData = await forecastResponse.json();
          setForecast(processForecastData(forecastData));
          
          
          await fetchAQI(currentData.coord.lat, currentData.coord.lon);
          
          console.log("Current Weather:", currentData);
          console.log("Forecast:", forecastData);
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
      setLocation("");
      setShowSuggestions(false);
    }
  };

  const searchLocation = (event) => {
    if (event.key === "Enter") {
      performSearch();
    }
  };

  const handleSearchClick = () => {
    performSearch();
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    setLocation(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    const fullLocation = `${suggestion.name}, ${suggestion.country}`;
    setLocation(fullLocation);
    setShowSuggestions(false);
    performSearch(fullLocation);
  };

  const getAQILevel = (aqi) => {
    const levels = {
      1: { level: "Good", color: "#00e400", description: "Air quality is satisfactory" },
      2: { level: "Fair", color: "#ffff00", description: "Air quality is acceptable" },
      3: { level: "Moderate", color: "#ff7e00", description: "Air quality is moderate" },
      4: { level: "Poor", color: "#ff0000", description: "Air quality is poor" },
      5: { level: "Very Poor", color: "#8f3f97", description: "Air quality is very poor" }
    };
    return levels[aqi] || { level: "Unknown", color: "#666", description: "Unknown air quality" };
  };

  const getWeatherIcon = (weatherMain) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '🌨️',
      'Mist': '🌫️',
      'Smoke': '🌫️',
      'Haze': '🌫️',
      'Fog': '🌫️'
    };
    return icons[weatherMain] || '🌤️';
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="app">
      <div className="glass-container">
        
        <div className="search-section">
          <div className="search-container">
            <div className="search-input-container">
              <input
                value={location}
                onChange={handleLocationChange}
                onKeyPress={searchLocation}
                placeholder="Enter Location"
                type="text"
                className="search-input"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.name}, {suggestion.country}
                      {suggestion.state && `, ${suggestion.state}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleSearchClick} className="search-button">
              🔍
            </button>
          </div>
        </div>

        
        {data.name && (
          <div className="nav-tabs">
            <button 
              className={`tab-button ${activeView === 'current' ? 'active' : ''}`}
              onClick={() => setActiveView('current')}
            >
              Current
            </button>
            <button 
              className={`tab-button ${activeView === 'forecast' ? 'active' : ''}`}
              onClick={() => setActiveView('forecast')}
            >
              7-Day Forecast
            </button>
            <button 
              className={`tab-button ${activeView === 'aqi' ? 'active' : ''}`}
              onClick={() => setActiveView('aqi')}
            >
              Air Quality
            </button>
          </div>
        )}

        
        {activeView === 'current' && (
          <div className="weather-section">
            <div className="location">
              <p>{data.name}</p>
            </div>
            <div className="temp">
              {data.main ? <h1>{data.main.temp.toFixed()}°c</h1> : null}
            </div>
            <div className="description">
              {data.weather ? (
                <p>
                  {getWeatherIcon(data.weather[0].main)} {data.weather[0].main}
                </p>
              ) : null}
            </div>
          </div>
        )}

        
        {activeView === 'forecast' && (
          <div className="forecast-section">
            <h2>7-Day Forecast</h2>
            <div className="forecast-grid">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-item">
                  <div className="forecast-date">{formatDate(day.date)}</div>
                  <div className="forecast-icon">{getWeatherIcon(day.weather.main)}</div>
                  <div className="forecast-temps">
                    <span className="temp-high">{day.temp_max.toFixed()}°</span>
                    <span className="temp-low">{day.temp_min.toFixed()}°</span>
                  </div>
                  <div className="forecast-desc">{day.weather.main}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        
        {activeView === 'aqi' && aqi && (
          <div className="aqi-section">
            <h2>Air Quality Index</h2>
            <div className="aqi-main">
              <div className="aqi-value" style={{ color: getAQILevel(aqi.list[0].main.aqi).color }}>
                {aqi.list[0].main.aqi}
              </div>
              <div className="aqi-level" style={{ color: getAQILevel(aqi.list[0].main.aqi).color }}>
                {getAQILevel(aqi.list[0].main.aqi).level}
              </div>
              <div className="aqi-description">
                {getAQILevel(aqi.list[0].main.aqi).description}
              </div>
            </div>
            <div className="aqi-components">
              <div className="component-item">
                <span className="component-label">CO</span>
                <span className="component-value">{aqi.list[0].components.co} μg/m³</span>
              </div>
              <div className="component-item">
                <span className="component-label">NO₂</span>
                <span className="component-value">{aqi.list[0].components.no2} μg/m³</span>
              </div>
              <div className="component-item">
                <span className="component-label">O₃</span>
                <span className="component-value">{aqi.list[0].components.o3} μg/m³</span>
              </div>
              <div className="component-item">
                <span className="component-label">PM2.5</span>
                <span className="component-value">{aqi.list[0].components.pm2_5} μg/m³</span>
              </div>
              <div className="component-item">
                <span className="component-label">PM10</span>
                <span className="component-value">{aqi.list[0].components.pm10} μg/m³</span>
              </div>
              <div className="component-item">
                <span className="component-label">SO₂</span>
                <span className="component-value">{aqi.list[0].components.so2} μg/m³</span>
              </div>
            </div>
          </div>
        )}

        
        {data.name !== undefined && activeView === 'current' && (
          <div className="stats-section">
            <div className="stat-item">
              {data.main ? <p className="stat-value">{data.main.feels_like.toFixed()}°c</p> : null}
              <p className="stat-label">Feels Like</p>
            </div>
            <div className="stat-item">
              {data.main ? <p className="stat-value">{data.main.humidity}%</p> : null}
              <p className="stat-label">Humidity</p>
            </div>
            <div className="stat-item">
              {data.wind ? <p className="stat-value">{data.wind.speed.toFixed()} MPH</p> : null}
              <p className="stat-label">Wind Speed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;