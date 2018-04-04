var map;
var maps = [];
var win = '';

var viewModel = {
    list: ko.observableArray([]),
    search: ko.observable(),

    constructor: function () {
        for (var i in maps) {
            viewModel.list.push(maps[i].title);
        }
    },
    find: function (query) {
        viewModel.list.removeAll();
        for (var j in maps) {
            if (maps[j].title.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                viewModel.list.push(maps[j].title);
                maps[j].setVisible(true);
            } else {
                maps[j].setVisible(false);
            }
        }
    }
}
viewModel.search.subscribe(viewModel.find);

function googleError() {
    alert('Map is not loading');
}

function restaurants() {
    var url = "https://developers.zomato.com/api/v2.1/location_details?entity_id=12&entity_type=city";
    $.ajax({
      url: url,
      dataType: 'JSON',
      headers: { "user-key": "fe5e1559f1dbadbe41b4610de4ad60a2" },
    }).done(function (response) {
        data = response.best_rated_restaurant;
        for (var i = 0; i < data.length; i++) {
            var marker = new google.maps.Marker({
                title: data[i].restaurant.name,
                position: {
                    lat: parseFloat(data[i].restaurant.location.latitude),
                    lng: parseFloat(data[i].restaurant.location.longitude)
                },
                map: map,
                animation: google.maps.Animation.DROP,
                address: data[i].restaurant.location.address
            });
            marker.addListener('click', info);
            maps.push(marker);
        }
        var Limits = new google.maps.LatLngBounds();
        for (var k in maps) {
            Limits.extend(maps[k].position);
        }
        map.fitBounds(Limits);
        viewModel.constructor();
    }).fail(function () {
        alert('parks cant be displayed');
    });
}

function info() {
    if (win.marker !== this && win.marker !== undefined) {
        stopMarker(win.marker);
    }
    this.setAnimation(google.maps.Animation.BOUNCE);
    var text = '<h1>' + ' Name - ' + this.title + '</h1>';
    text += '<h2>' + ' Address - ' + this.address + '</h2>';
    win.marker = this;
    win.setContent(text);
    win.open(map, this);
    win.addListener('closeclick', stopMarker);
}

function stopMarker(marker) {
    win.marker.setIcon(null);
    win.marker.setAnimation(null);
}

function open(title) {
    for (var j in maps) {
        if (maps[j].title == title) {
            info(maps[j]);
            return;
        }
    }
}

function beginMap() {
    var styles=[
    {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#4f5b66'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#36dd5a'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry.fill',
                stylers: [{color: '#25df7'}]
              },
   {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{color: '#2E84CE'}]
    },
     {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#4eb5dd'}]
    }];
    win = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 19.0760,
            lng: 72.8777
        },
        zoom: 11,
        styles: styles
    });
    restaurants();
}

ko.applyBindings(viewModel);