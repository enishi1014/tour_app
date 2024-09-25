// Amazon Location Serviceを使用してマップを表示
document.addEventListener('DOMContentLoaded', function () {
    // マップを初期化
    var map = new maplibregl.Map({
        container: 'map',
        style: 'https://maps.geo.ap-northeast-1.amazonaws.com/maps/v0/maps/YourMapName/style-descriptor',
        center: [139.6917, 35.6895], // 東京の中心座標
        zoom: 12
    });

    // マップにマーカーを追加する例
    fetch('/api/map_data')
        .then(response => response.json())
        .then(data => {
            data.locations.forEach(function (location) {
                new maplibregl.Marker()
                    .setLngLat(location.coordinates)
                    .setPopup(new maplibregl.Popup().setText(location.name))
                    .addTo(map);
            });
        });

    // ルート提案を表示する例
    fetch('/api/routes')
        .then(response => response.json())
        .then(routes => {
            var route = routes['default']; // デフォルトのルートを選択
            drawRouteOnMap(route.coordinates);
        });

    function drawRouteOnMap(coordinates) {
        // 既存のルートを削除
        if (map.getSource('route')) {
            map.removeLayer('route');
            map.removeSource('route');
        }
        // 新しいルートを追加
        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coordinates
                }
            }
        });
        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {},
            'paint': {
                'line-color': '#ff0000',
                'line-width': 4
            }
        });
    }
});
