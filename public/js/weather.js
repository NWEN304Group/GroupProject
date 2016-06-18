if("geolocation" in navigator){
	navigator.geolocation.getCurrentPosition(function(position){
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		loadWeather(latitude + ',' + longitude);
	});
}else{
	loadWeather("Wellington, NZ", "");
}

function loadWeather(location, woeid){
	$.simpleWeather({
		location: location,
		woeid: woeid,
		unit: 'c',
		success: function(weather){
			wcode = weather.code;
			city  = weather.city;
			console.log(weather.currently);
			console.log(wcode);
			console.log(city);

			$.ajax({
            url: '/weather/' + weather.currently,
            type: 'PUT'
        });
		},
		error: function(error){

		}
	});
};