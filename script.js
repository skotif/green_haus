/*   var wind_power = wind_speed * wind_speed * 0.1;
  var coal_gas_power = 36 - wind_power;
  var emission = (4.1 * 12 + 10 * 230 + coal_gas_power * 700 + wind_power * 11) / 50;const */
CURRENT_LOCATION = document.getElementsByClassName('weather-content__overview')[0];
const CURRENT_TEMP = document.getElementsByClassName('weather-content__temp')[0];
const FORECAST = document.getElementsByClassName('component__forecast-box')[0];

const appid = 'e43f64ee98be9268f7a7f49e34aecfdf'; // use your own API KEY plz
/* const units = 'METRIC'; */

// Use Fetch API to GET data from OpenWeather API
function getWeatherData(position) {
  const headers = new Headers();
  const URL = `https://api.openweathermap.org/data/2.5/forecast/daily?${position}&cnt=7&units=metric&APPID=${appid}`;
  return fetch(URL, {
    method: 'GET',
    headers: headers
  }).then(data => data.json());
}


// Use Fetch API to GET data from OpenWeather API
function getHourlyForecast(position) {
  const headers = new Headers();
  const URL = `https://api.openweathermap.org/data/2.5/forecast?${position}&cnt=40&units=metric&APPID=${appid}`

  return fetch(URL, {
    method: 'GET',
    headers: headers
  }).then(data => data.json());
}

/* TUTORIAL READERS:
 ** I am using an external resource for the icons and applying them 
 ** here using a switch block; check the sidebar "Resources" to get
 ** the css if you want to use these icons
 */
function applyIcon(icon) {
  let selectedIcon;
  switch (icon) {
    case '01d':
      selectedIcon = "wi-day-sunny"
      break;
    case '01n':
      selectedIcon = "wi-night-clear"
      break;
    case '02d':
    case '02n':
      selectedIcon = "wi-cloudy"
      break;
    case '03d':
    case '03n':
    case '04d':
    case '04n':
      selectedIcon = "wi-night-cloudy"
      break;
    case '09d':
    case '09n':
      selectedIcon = "wi-showers"
      break;
    case '10d':
    case '10n':
      selectedIcon = "wi-rain"
      break;
    case '11d':
    case '11n':
      selectedIcon = "wi-thunderstorm"
      break;
    case '13d':
    case '13n':
      selectedIcon = "wi-snow"
      break;
    case '50d':
    case '50n':
      selectedIcon = "wi-fog"
      break;
    default:
      selectedIcon = "wi-meteor"
  }
  return selectedIcon;
}


renderTopBar = (location, forecast) => {
  // render city, current weather description and temp
  /*   const currentWeather = forecast[0].weather[0]; */
/*   const widgetHeader = `<h1>${location.name}</h1>`; */
  const widgetHeader = `<h1>${location.name}</h1>`;
  CURRENT_TEMP.innerHTML = ` ${Math.round(forecast)}g <small>co2/kwg</small>`;
  console.log(widgetHeader);
  CURRENT_LOCATION.innerHTML = widgetHeader;
}


renderMiddleBar = (forecast, hourly) => {
  // render each daily forecast
  var i = 0
  forecast.forEach(day => {
    let date = new Date(day.dt * 1000);
    let days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    let name = days[date.getDay()];
    let dayBlock = document.createElement("div");
    dayBlock.className = 'forecast__item';
    dayBlock.id = `forecast_tile_day_${i}`
    var co2emissions = Math.round(calculateCo2Emissions(day.speed))
    dayBlock.innerHTML = `<div class="forecast-item__heading">${name}</div>
      <div class="forecast-item__info" id="day-${i}""> <span class="degrees">${co2emissions}</div>`;


    FORECAST.appendChild(dayBlock);
    i = i + 1
  });
}

renderHourlyForecast = (times, forecast, from_time) => {
  /* console.log(from_time); */

  var timeline = []

  for (let i = 0; i < times.length; i++) {
    var date = new Date(times[i] * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    timeline.push((hours - 1).toString() + ":00");
  }

  var start_index = times.findIndex(elem => elem > from_time);

  new Chart("myChart", {
    type: "line",
    data: {
      labels: timeline.slice(start_index, start_index + 8),
      datasets: [{
        data: forecast.slice(start_index, start_index + 8),
        borderColor: "rgba(231, 107, 116, 1)",
        fill: false
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'g co2/kwh'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'time'
          }
        }]
      }
    }
  });

}

// Use returned json from promise to render daily forecast
renderData = (location, forecast) => {


}

calculateCo2Emissions = (wind_speed) => {
  var wind_power = wind_speed * wind_speed * 0.09;
  var coal_gas_power = 36 - wind_power;
  var emission = (4.1 * 12 + 10 * 230 + coal_gas_power * 700 + wind_power * 11) / 50;
  return emission;
}

class Application {
  constructor(position) {
    this.position = position;
    this.daily_forecast = null;
    /* this.hourly_forecast = null; */
    this.clock = new Date();
    this.hours = []
    this.emissions = []
  }

  setDailyForecast(daily_forecast) {
    this.daily_forecast = daily_forecast;
  }

  /*   setHourlyForecast(hourly_forecast) {
      this.hourly_forecast = hourly_forecast;
    } */

  setHourlyNorthSea(hourly_forecast) {
    this.hourly_north_sea = hourly_forecast;
    for (let i = 0; i < this.hourly_north_sea.list.length; i++) {
      this.hours.push(this.hourly_north_sea.list[i].dt);
      this.emissions.push(calculateCo2Emissions(this.hourly_north_sea.list[i].wind.speed));
    }
  }

  setLocation(city) {
    this.location = city;
  }

  renderAll() {
    if ((this.location != null) && (this.daily_forecast != null) && (this.hourly_north_sea != null)) {
      renderTopBar(this.location, this.emissions[0]);
      renderMiddleBar(this.daily_forecast);
      renderData(this.location, this.daily_forecast);
      this.renderHourly(this.clock.getTime() / 1000);
    }
  }

  renderHourly(start_time) {
    renderHourlyForecast(this.hours, this.emissions, start_time);
    document.getElementById(`day-0`).style.backgroundColor = '#aaa';


    function greet(event, day_shift, application) {
      for (let i = 0; i < 5; i++) {
        document.getElementById(`day-${i}`).style.backgroundColor = '#fff';
      }
      document.getElementById(`day-${day_shift}`).style.backgroundColor = '#aaa';
      console.log(document.getElementById(`day-${day_shift}`))
      // print the event object to console
      console.log('greet:', event)
      if (day_shift == 0) {
        renderHourlyForecast(application.hours, application.emissions, Math.floor(application.clock.getTime() / 1000));
      } else {
        renderHourlyForecast(application.hours, application.emissions, Math.floor(application.clock.getTime() / 1000 / 60 / 60 / 24) * 60 * 60 * 24 + day_shift * 24 * 60 * 60);
      }
    }


    for (let i = 0; i < 5; i++) {
      var element = document.getElementById(`forecast_tile_day_${i}`);
      element.onclick = (event) => greet(event, i, this);
    }
  }
}

/* if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position) */
 var position = { coords: {
        accuracy: 949.0470135729332,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 48.136192,
        longitude: 11.6424704,
        speed: null },
        timestamp: 1643116575318}; 
     const coordinates = `lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
    var application = new Application(position);
    getWeatherData(coordinates).then(weatherData => {
      const city = weatherData.city;
      application.setLocation(city);
      application.renderAll();
    });
    
    getWeatherData("lat=53.9830062&lon=8.6441204").then(weatherData => {
      const city = weatherData.city;
      const dailyForecast = weatherData.list;
      application.setDailyForecast(dailyForecast);
      application.renderAll();
    });
    
    getHourlyForecast("lat=53.9830062&lon=8.6441204").then(weatherData => {
      application.setHourlyNorthSea(weatherData);
      application.renderAll();
    });

/*   }, e => console.log(e)); */
/* } else {
  console.log('unable to retrieve location from browser')
}
 */
