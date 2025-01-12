const API_KEY = "cd1ee7acd39298c9dd038ec0f540523b";

const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');
const grantAcess = document.querySelector('[data-grantAccess]');
const searchBar = document.querySelector('[data-searchBar]');
const weatherInformation = document.querySelector('[data-weatherInformation]');
const titleBar = document.querySelector('[data-titleBar]');
const loading = document.querySelector('[data-Loading]');

let currentTab = userTab;
currentTab.classList.add('currentTab');
if(sessionStorage.getItem('user-coordinates') != null)
    getFromSessionStorage();
else
    grantAcess.classList.add('active');


function switchTab(clickedTab) {
    
    if(currentTab != clickedTab) {
        currentTab.classList.remove('currentTab');
        let prevTab = currentTab;
        currentTab = clickedTab;
        currentTab.classList.add('currentTab');

        if(prevTab == userTab) {
            //we should need to switch to the search Bar tab
            weatherInformation.classList.remove('active');
            grantAcess.classList.remove('active');
            searchBar.classList.add('active');
        }
        else{
            //we should need to switch to the user tab
            weatherInformation.classList.remove('active');
            searchBar.classList.remove('active');
            getFromSessionStorage();

        }
    }
}

userTab.addEventListener('click', () => {
    switchTab(userTab);
})

searchTab.addEventListener('click', () => {
    switchTab(searchTab);
})

function getFromSessionStorage() {
    let coordinates = sessionStorage.getItem("user-coordinates");

    if(!coordinates) {
        titleBar.classList.remove('active');
        grantAcess.classList.add('active');
    }
    else {
        titleBar.classList.add('active');
        const userCoordinates = JSON.parse(coordinates);
        fetchWeatherInfo(userCoordinates);
    }
}

async function fetchWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    loading.classList.add('active');
    

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        loading.classList.remove('active');
        weatherInformation.classList.add('active');
        updateUI(data);

    }
    catch(e) {
        loading.classList.remove('active');
    }

    
}

function updateUI(weatherInfo){

    const cityName = document.querySelector('[data-cityName]');
    const cityFlag = document.querySelector('[data-cityFlag]');
    const weatherDescription = document.querySelector('[weather-description]');
    const weatherImage = document.querySelector('[weather-image]');
    const weatherTemperature = document.querySelector('[weather-temperture]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const cloudiness = document.querySelector('[data-cloudiness]');

    //Put the data from the data
    cityName.innerText = weatherInfo?.name;
    cityFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    weatherDescription.innerText = weatherInfo?.weather?.[0]?.description;
    weatherImage.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`
    weatherTemperature.innerText = weatherInfo?.main?.temp;
    windspeed.innerText = weatherInfo?.wind?.speed;
    humidity.innerText = weatherInfo?.main?.humidity;
    cloudiness.innerText = weatherInfo?.clouds?.all;
    
}

const grantBtn = document.querySelector('[grantAccessBtn]');

grantBtn.addEventListener('click', getLocation);

function getLocation() {

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(findPosition);
    }
    else{
        alert('Your browser does not support Geolocation services');
    }
}

function findPosition (position) {
    let coordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    }

    sessionStorage.setItem('user-coordinates', JSON.stringify(coordinates) );
    grantAcess.classList.remove('active');
    titleBar.classList.add('active');
    fetchWeatherInfo(coordinates);
}

const searchInput = document.querySelector('[data-searchInput]');
const searchBtn = document.querySelector('[data-searchBtn]');

searchInput.addEventListener('keydown', (e) => {
    if(13 == e.keyCode) {
        searchBtnAction();
    }
})

function searchBtnAction() {
    weatherInformation.classList.remove('active');
    const city = searchInput.value;

    if(city === "") {
        alert('Enter a City name');
        return;
    }

    getWeatherInfo(city);
}

searchBtn.addEventListener('click', searchBtnAction);

async function getWeatherInfo(city) {
    loading.classList.add('active');

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        if(!data.sys) 
            throw data;

        loading.classList.remove('active');
        weatherInformation.classList.add('active');
        updateUI(data);

    }
    catch(e){
        await loading.classList.remove('active');
        alert('City not found');

    }

    searchInput.value = "";
}