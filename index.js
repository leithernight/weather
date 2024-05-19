const API_TOKEN = 'bb8a79cf8cd6d9ec192b3560694e9c0c';

let coords = [54.193122, 37.617348];
$('#search').val('Tula');

let date = new Date();
let time = String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth()).padStart(2, '0') + '.' + date.getFullYear();
$('#today__date').text(time);
getCurrentToday(coords[0], coords[1]);
getTodayForecast(coords[0], coords[1]);
getNearby(coords[0], coords[1]);

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
        getCurrentToday(position.coords.latitude, position.coords.longitude);
        coords = [position.coords.latitude, position.coords.longitude];
        $.getJSON('https://api.openweathermap.org/data/2.5/weather?lat=' + coords[0] + '&lon=' + coords[1] + '&appid=' + API_TOKEN, function(json) {
            $('#search').val(json.name);
        });
    });
}

$('#btn__today').click(function(e) {
    e.preventDefault();
    $('#btn__today').addClass('active');
    $('#btn__5day').removeClass('active');
    $('#block__today').removeClass('disabled');
    $('#block__5day').addClass('disabled');
    $('#block__error').addClass('disabled');
    $('#block__error').removeClass('enabled');
    $('#block__hourly').removeClass('disabled');
    $('#block__nearby').removeClass('disabled');
    getCurrentToday(coords[0], coords[1]);
    getTodayForecast(coords[0], coords[1]);
    getNearby(coords[0], coords[1]);
});

$('#btn__5day').click(function(e) {
    e.preventDefault();
    $('#btn__5day').addClass('active');
    $('#btn__today').removeClass('active');
    $('#block__today').addClass('disabled');
    $('#block__5day').removeClass('disabled');
    $('#block__error').addClass('disabled');
    $('#block__error').removeClass('enabled');
    $('#block__hourly').removeClass('disabled');
    $('#block__nearby').addClass('disabled');
    get5DayInfo(coords[0], coords[1]);
    get5DayForecast(coords[0], coords[1]);
});

$('#btn__search').click(function(e) {
    e.preventDefault();
    $.getJSON('https://api.openweathermap.org/geo/1.0/direct?q=' + $('#search').val() + '&appid=' + API_TOKEN, function(json) {
        if (json.length === 0) {
            showError();
        } else {
            coords = [json[0].lat, json[0].lon];
            $('.active')[0].click();
        }
    });
})

$('.cell').each(function() {
    $(this).click(function() {
        $('.cell').removeClass('selected');
        $(this).addClass('selected');
        get5DayForecast(coords[0], coords[1]);
    })
})

function showError() {
    $('#block__error').removeClass('disabled');
    $('#block__today').addClass('disabled');
    $('#block__5day').addClass('disabled');
    $('#block__nearby').addClass('disabled');
    $('#block__hourly').addClass('disabled');
    $('#block__error').addClass('enabled');
}

function getCurrentToday(latitude, longitude) {
    $.getJSON('https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&appid=' + API_TOKEN + '&units=metric', function(json) {
        $('#today__icon').attr('src', 'https://openweathermap.org/img/wn/' + json.weather[0].icon + '@2x.png');
        $('#today__desc').text(json.weather[0].main);
        $('#today__temp').text(Math.floor(json.main.temp) + '°C');
        $('#today__feels').text('Feels like ' + Math.floor(json.main.feels_like) + '°');
        let sunrise = new Date(json.sys.sunrise * 1000); 
        $('#today__sunrise').text(((sunrise.getHours() + (json.timezone / 3600 - 3)) < 0 ? sunrise.getHours() + (json.timezone / 3600 - 3) + 24 : sunrise.getHours() + (json.timezone / 3600 - 3)) % 24 + ':' + String(sunrise.getMinutes()).padStart(2, '0'))
        let sunset = new Date(json.sys.sunset * 1000); 
        $('#today__sunset').text(((sunset.getHours() + (json.timezone / 3600 - 3)) < 0 ? sunset.getHours() + (json.timezone / 3600 - 3) + 24 : sunset.getHours() + (json.timezone / 3600 - 3)) % 24 + ':' + String(sunset.getMinutes()).padStart(2, '0'));
        let duration = json.sys.sunset - json.sys.sunrise;
        $('#today__duration').text(Math.floor(duration / 3600) + ':' + String(Math.floor(duration % 3600 / 60)).padStart(2, '0'));

    });
}

function get5DayInfo(latitude, longitude) {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    $.getJSON('https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&appid=' + API_TOKEN + '&units=metric', function(json) {
        let data = json.list.filter(item => new Date(item.dt * 1000).getHours() === (12 + json.city.timezone / 3600 - 3)); 
        if (new Date().getHours() > 12) {
            let date = new Date(json.list[0].dt * 1000);
            $('.cell').eq(0).find('.day').text(MONTHS[date.getUTCMonth()] + ' ' + date.getUTCDate());
            $('.cell').eq(0).find('img').attr('src', 'https://openweathermap.org/img/wn/' + json.list[0].weather[0].icon + '@2x.png');
            $('.cell').eq(0).find('.temp').text(Math.floor(json.list[0].main.temp) + '°C');
            $('.cell').eq(0).find('.forecast').text(json.list[0].weather[0].main);
            for (let i = 1; i < 5; i++) {
                let date = new Date(data[i-1].dt * 1000);
                $('.cell').eq(i).find('.hdr').text(DAYS[date.getUTCDay()]);
                $('.cell').eq(i).find('.day').text(MONTHS[date.getUTCMonth()] + ' ' + date.getUTCDate());
                $('.cell').eq(i).find('img').attr('src', 'https://openweathermap.org/img/wn/' + data[i-1].weather[0].icon + '@2x.png');
                $('.cell').eq(i).find('.temp').text(Math.floor(data[i-1].main.temp) + '°C');
                $('.cell').eq(i).find('.forecast').text(data[i-1].weather[0].main);
            }
        } else {
            let date = new Date(json.list[0].dt * 1000);
            $('.cell').eq(0).find('.day').text(MONTHS[date.getUTCMonth()] + ' ' + date.getUTCDate());
            $('.cell').eq(0).find('img').attr('src', 'https://openweathermap.org/img/wn/' + data[0].weather[0].icon + '@2x.png');
            $('.cell').eq(0).find('.temp').text(Math.floor(data[0].main.temp) + '°C');
            $('.cell').eq(0).find('.forecast').text(data[0].weather[0].main);
            for (let i = 1; i < 5; i++) {
                let date = new Date(data[i].dt * 1000);
                $('.cell').eq(i).find('.hdr').text(DAYS[date.getUTCDay()]);
                $('.cell').eq(i).find('.day').text(MONTHS[date.getUTCMonth()] + ' ' + date.getUTCDate());
                $('.cell').eq(i).find('img').attr('src', 'https://openweathermap.org/img/wn/' + data[i].weather[0].icon + '@2x.png');
                $('.cell').eq(i).find('.temp').text(Math.floor(data[i].main.temp) + '°C');
                $('.cell').eq(i).find('.forecast').text(data[i].weather[0].main);
            }
        }
    });
}

function getTodayForecast(latitude, longitude) {
    $.getJSON('https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&appid=' + API_TOKEN + '&units=metric', function(json) {
        for (let i = 0; i < 6; i++) {
            let date = new Date(json.list[i].dt * 1000);
            $('.hourly__hour').eq(i).text(((date.getHours() + (json.city.timezone / 3600 - 3)) < 0 ? date.getHours() + (json.city.timezone / 3600 - 3) + 24 : date.getHours() + (json.city.timezone / 3600 - 3)) % 24 + ':00');
            $('.hourly__icon').eq(i).attr('src', 'https://openweathermap.org/img/wn/' + json.list[i].weather[0].icon + '@2x.png');
            $('.hourly__forecast').eq(i).text(json.list[i].weather[0].main);
            $('.hourly__temp').eq(i).text(Math.floor(json.list[i].main.temp) + '°C');
            $('.hourly__feels').eq(i).text(Math.floor(json.list[i].main.feels_like) + '°');
            $('.hourly__wind').eq(i).text((json.list[i].wind.speed*3600/1000).toFixed(1) + ' ' + getDirection(json.list[i].wind.deg));
        }
    });
}

function get5DayForecast(latitude, longitude) {
    $.getJSON('https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&appid=' + API_TOKEN + '&units=metric', function(json) {
        if ($('.cell').index($('.cell.selected')) === 0) {
            getTodayForecast(coords[0], coords[1]);
        } else {
            let dateSelected = new Date(json.list[0].dt * 1000 + json.city.timezone * 1000 + $('.cell').index($('.cell.selected')) * 24 * 3600 * 1000);
            let data = json.list.filter(item => (new Date(item.dt * 1000 + json.city.timezone * 1000).getDate() == dateSelected.getDate()));
            for (let i = 0; i < 6; i++) {
                let date = new Date(data[i+2].dt * 1000 + json.city.timezone * 1000);
                $('.hourly__hour').eq(i).text((((date.getHours() + (json.city.timezone / 3600 - 3)) < 0 ? date.getHours() + (json.city.timezone / 3600 - 3) + 24 : date.getHours() + (json.city.timezone / 3600 - 3)) % 24 + ':00'));
                $('.hourly__icon').eq(i).attr('src', 'https://openweathermap.org/img/wn/' + data[i+2].weather[0].icon + '@2x.png');
                $('.hourly__forecast').eq(i).text(data[i+2].weather[0].main);
                $('.hourly__temp').eq(i).text(Math.floor(data[i+2].main.temp) + '°C');
                $('.hourly__feels').eq(i).text(Math.floor(data[i+2].main.feels_like) + '°');
                $('.hourly__wind').eq(i).text((data[i+2].wind.speed*3600/1000).toFixed(1) + ' ' + getDirection(data[i+2].wind.deg));
            }
        }
    });
}

function getNearby(latitude, longitude) {
    $.getJSON('https://api.openweathermap.org/data/2.5/find?lat=' + latitude + '&lon=' + longitude + '&appid=' + API_TOKEN + '&units=metric', function(json) {
        for (let i = 0; i < 4; i++) {
            $('.place').eq(i).find('.city').text(json.list[i].name);
            $('.place').eq(i).find('img').attr('src', 'https://openweathermap.org/img/wn/' + json.list[i].weather[0].icon + '@2x.png');
            $('.place').eq(i).find('.temp').text(Math.floor(json.list[i].main.temp) + '°C');
        }
    });
}

function getDirection(deg) {
    let directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(deg / 22.5) % 16];
}