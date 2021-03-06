function initMap(){
  var totalDistance = 0;
  var totalElevation = 0;
  var totalHeartrate = 0;
  var totalCadence = 0;
  var elevations = [];
  var allDates = [];
  var allTimes = [];
  var allPoints = [];
  var allHeartrates = [];
  var allCadence = [];
  $.ajax({
    url: "xml/running.gpx",
    dataType: "xml",
    success: function(data){
	var name = $(data).find('trk name').text();
  	$("#name").append(name);
	var pointNumber = 1;
	var previousLat;
	var previousLon;
	$(data).find('trk trkseg trkpt').each(function() {
		var currentLat = $(this).attr("lat");
		var currentLon = $(this).attr("lon");
		currentLat = parseFloat(currentLat);
		currentLon = parseFloat(currentLon);
		var point = {lat: currentLat, lng: currentLon};
		allPoints.push(point);
		if(pointNumber > 1){
			totalDistance += distance(currentLat, currentLon, previousLat, previousLon);
		}
		var extension = $(this).find('extensions').text();
		var heartrate = extension.match(/[-+]?(\d*\.?\d+)/g)[0];
		var cadence = extension.match(/[-+]?(\d*\.?\d+)/g)[1];

		totalHeartrate += parseInt(heartrate);
		totalCadence += parseInt(cadence);

		allHeartrates.push(heartrate);
		allCadence.push(cadence);

		previousLat = currentLat;
		previousLon = currentLon;

		pointNumber++;

		var currentElevation = $(this).find('ele').text();
		elevations.push(currentElevation);
		totalElevation += parseInt(currentElevation);


		var currentTime = $(this).find('time').text();
		var date = currentTime.substring(0,10);
		allDates.push(date);
		var actualTime = currentTime.substring(11,19);
		allTimes.push(actualTime);		
	});
	$("#distanceTravelled").append(totalDistance.toFixed(2) + " miles");
	$("#highestPoint").append(Math.max(...elevations).toFixed(2) + " feet");
	$("#lowestPoint").append(Math.min(...elevations).toFixed(2) + " feet");
	$("#averageElevation").append((totalElevation/elevations.length).toFixed(2) + " feet");

	$("#highestHeartrate").append(Math.max(...allHeartrates).toFixed(0) + " beats per minute");
	$("#lowestHeartrate").append(Math.min(...allHeartrates).toFixed(0) + " beats per minute");
	$("#averageHeartrate").append((totalHeartrate/allHeartrates.length).toFixed(0) + " beats per minute");

	$("#highestCadence").append(Math.max(...allCadence).toFixed(0) + " steps per minute");
	$("#averageCadence").append((totalCadence/allCadence.length).toFixed(0) + " steps per minute");


	var timeStart = new Date(allDates[0] + " " + allTimes[0]);
	var timeEnd = new Date(allDates[allDates.length-1] + " " + allTimes[allTimes.length-1]);
	var timeTaken = timeEnd.getTime() -timeStart.getTime();

	var msec = timeTaken;
	var hh = Math.floor(msec / 1000 / 60 / 60);
	msec -= hh * 1000 * 60 * 60;
	var mm = Math.floor(msec / 1000 / 60);
	msec -= mm * 1000 * 60;
	var ss = Math.floor(msec / 1000);
	msec -= ss * 1000;

	$("#startTime").append(allTimes[0] + " (" + allDates[0] + ")");
	$("#endTime").append(allTimes[allDates.length-1] + " (" + allDates[allDates.length-1] + ")");
	$("#timeTaken").append(hh + ":" + mm + ":" + ss);
	
	var numberOfMinutes = parseFloat(ss/60) + mm;
	var numberOfHours = numberOfMinutes/60 + hh;
	$("#averageSpeed").append((parseFloat(totalDistance)/parseFloat(numberOfHours)).toFixed(2) + " mph");

	var uluru = {lat: allPoints[0]["lat"], lng: allPoints[0]["lng"]};
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 14,
		center: uluru
		});

	for(var i = 0; i < allPoints.length; i++){
		if(i == 0){
			var label = "Start";
			var color = "green";
		}
		else{
			var label = "End";
			var color = "red";
		}
		var marker = new google.maps.Marker({
				position: allPoints[i],
				icon: {
        				path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
					fillColor: color,
					fillOpacity: 1,
        				strokeColor: "black",
					strokeWeight: 2,
        				scale: 4
    				},
				label: label,
				map: map
				});

		marker.setMap(map);
		i += (allPoints.length-2);
	}


	var runningPath = new google.maps.Polyline({
	  path: allPoints,
	  geodesic: true,
	  strokeColor: '#FF0000',
	  strokeOpacity: 1.0,
	  strokeWeight: 2
	});

	runningPath.setMap(map);

    },
    error: function(){
	$('#name').text("Failed");
    }

  });


};

function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}


