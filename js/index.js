const API_KEY = "0592a806d34d7a3aacbf80f3faafe1d1";
const CORS_PROXY = "https://crossorigin.me/";
const API_BASE = "http://api.openweathermap.org/data/2.5/";
var curPos;
var curWeather;
var curForecast;
var curTempSetting = "F";

function FetchLocation() {
  if (navigator.geolocation) {
    Message("Determining location . . .");
    navigator.geolocation.getCurrentPosition(SetLocation, ErrorGettingLocation);
  } else {
    ErrorGettingLocation();
  }
}

function SetLocation(position) {
  curPos = position;
  FetchWeather();
}

function FetchWeather() {
  if (curPos) {
    Message("Fetching weather . . .");
    $("#weather-content").empty();
    $.getJSON(CORS_PROXY + API_BASE + "weather?" +
        "lat=" + curPos.coords.latitude +
        "&lon=" + curPos.coords.longitude +
        "&appid=" + API_KEY,
        SetWeather)
      .fail(ErrorFetchingWeather)
      .done(FetchForecast);
  }
}

function FormatTemperature(tmpK) {
  if (curTempSetting === "F") {
    return Math.round(32 + (tmpK - 273.15) * 1.8) + "&deg;";
  } else {
    return Math.round(tmpK - 273.15) + "&deg";
  }
}

function SetWeather(jsonData) {
  curWeather = jsonData;
  Message("");
  UpdateWeatherText();
  UpdateWeatherIcon();
  $("#convert-temp").show();
}

function UpdateWeatherText() {
  if (curWeather) {
    $("#weather-content").append("<p>" + curWeather.name + ", " + curWeather.sys.country + "</p>");
    $("#weather-content").append("<p>" + curWeather.weather[0].description + "</p>");
    var temp = $("<p></p>");
    var tempNumber = $("<span></span>").addClass("temperature")
    tempNumber.data('temperature', curWeather.main.temp);
    tempNumber.html(FormatTemperature(tempNumber.data("temperature")));
    temp.append(tempNumber);
    temp.append($("<span> " + curTempSetting + "</span>").addClass("temp-unit"));
    $("#weather-content").append(temp);
  } else {
    $("#weather-content").html("<p>Sorry!</p><p>Weather is currently unavailable.</p>");
  }
}

function GetWeatherIconHTML(id) {
  return "<i class='wi wi-owm-" + id + "'></i>"
}

function UpdateWeatherIcon() {
  if (curWeather) {
    $("#icon-wrapper").html(GetWeatherIconHTML(curWeather.weather[0].id));
  } else {
    $("#icon-wrapper").html("");
  }
}

function FetchForecast() {
  if (curPos) {
    Message("Fetching 5-day forecast . . .");
    $.getJSON(CORS_PROXY + API_BASE + "forecast/daily?" +
        "lat=" + curPos.coords.latitude +
        "&lon=" + curPos.coords.longitude +
        "&appid=" + API_KEY,
        SetForecast)
      .fail(ErrorFetchingForecast);
  }
}

function SetForecast(jsonData) {
  curForecast = jsonData;
  Message("");
  UpdateForecast();
}

function GetDayOfWeek(timestamp) {
  var dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var date = new Date(timestamp * 1000);
  return dow[date.getDay()];
}

function UpdateForecast() {
  //Deliberately skip the first (current day) forecast
  for (var i = 1; i < curForecast.list.length; i++) {
    var div = $("<div></div>").addClass("forecast-day");
    div.append($("<h4>" + GetDayOfWeek(curForecast.list[i].dt) + "</h4>"));
    var icon = $("<p></p>").addClass("forecast-icon");
    icon.html(GetWeatherIconHTML(curForecast.list[i].weather[0].id));
    div.append(icon);
    var temp = $("<p></p>");
    var tempHigh = $("<span></span>").addClass("temperature high");
    var tempLow = $("<span></span>").addClass("temperature low");
    tempHigh.data("temperature", curForecast.list[i].temp.max);
    tempHigh.html(FormatTemperature(tempHigh.data("temperature")));
    tempLow.data("temperature", curForecast.list[i].temp.min);
    tempLow.html(FormatTemperature(tempLow.data("temperature")));
    temp.append(tempHigh, " | ", tempLow);
    div.append(temp);
    $("#forecast-wrapper").append(div);
  }
}

function UpdateTemperatureUnits() {
  $(".temperature").each(function(index) {
    $(this).html(FormatTemperature($(this).data("temperature")));
  });
  $(".temp-unit").html(" " + curTempSetting);
}

function Message(msg) {
  $("#message").html("<p>" + msg + "</p>");
}

function ErrorGettingLocation() {
  Message("Error determining location. Geolocation may be disabled. If you are using Google Chrome, be sure you are connecting to https rather than http.");
}

function ErrorFetchingWeather() {
  Message("Sorry! Currently unable to connect to Weather API.");
}

function ErrorFetchingForecast() {
  Message("Sorry! Currently unable to fetch the five day forecast.");
}

$("#weather-content").on('click', ".temp-unit", function(event) {
  curTempSetting = (curTempSetting === "F") ? "C" : "F";
  UpdateTemperatureUnits();
});

$(document).ready(function() {
  FetchLocation();
});