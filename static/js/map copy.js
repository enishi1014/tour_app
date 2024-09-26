// マップの初期化と設定
document.addEventListener('DOMContentLoaded', function () {
    // Amazon Location Serviceの設定
    const apiKey = "v1.public.eyJqdGkiOiIzODVjMGU5OS00NDI4LTQyZmMtOTY4ZS02OWVkYjI1Y2QxMWEifSYNGsUw2rs7pgeRhhpCtTFHWZw3xQpY4QxGIiAIoC6Uz62F6Y1YRhJ08z9B1HG7tdcLApNZqeK-mpXFGZJ3mcNliJRh_TeIvp5Ci8BZIr_qD9NJUXHSEoPqDTKAWD72QAMjvDl31aOhpcLI-0g8K-JmP8Zhb01fjblMmHVWFU-VtrEpJ__1JYLGAd0W42gC-0kJmWXucvfx4qR41-cxCN21zYUAUL6TBfvy1qRrKCkyJsP_qHIbl3otPSs1C08jHtOiac35ryRc91JrBfq2IB6maFJ6yAnL-WWRgJjYniA4zaOYhI-MtBrm18VahqbFGSriZtNpbHTdyReCZSQGym4.ZTA2OTdiZTItNzgyYy00YWI5LWFmODQtZjdkYmJkODNkMmFh";
    const mapName = "mymap";
    const region = "ap-southeast-2";

    const map = new maplibregl.Map({
    container: "map",
    style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
    center: [139.6917, 35.6895],
    zoom: 11,
    });


        // 現在地を取得して表示する関数
    function showCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const userCoords = [position.coords.longitude, position.coords.latitude];
                    console.log('現在地:', userCoords);
    
                    // 現在地にマーカーを追加
                    new maplibregl.Marker({ color: "blue" })
                        .setLngLat(userCoords)
                        .setPopup(new maplibregl.Popup().setText('現在地'))
                        .addTo(map);
    
                    // 地図の中心を現在地に移動
                    map.setCenter(userCoords);
                    map.setZoom(14);  // 現在地にズーム
                }, error => {
                    console.error('現在地を取得できませんでした:', error);
                });
            } else {
                console.error('Geolocation APIがサポートされていません。');
            }
        }
    
        // ページ読み込み時に現在地を表示
    showCurrentLocation();
   // モデルコースデータの読み込み
   fetch('static/data/model_courses.json')
   .then(response => response.json())
   .then(data => {
       initializeCourseSelector(data);
   })
   .catch(error => console.error('Error loading model courses:', error));

// モデルコース選択メニューの初期化
function initializeCourseSelector(courses) {
   const courseSelect = document.getElementById('course-select');

   // セレクトボックスにコースを追加
   courses.forEach((course, index) => {
       const option = document.createElement('option');
       option.value = index;
       option.textContent = course.name;
       courseSelect.appendChild(option);
   });

   // コースが選択されたときのイベントリスナー
   courseSelect.addEventListener('change', function () {
       const selectedIndex = this.value;
       if (selectedIndex !== '') {
           const selectedCourse = courses[selectedIndex];
           displayCourse(selectedCourse);
       } else {
           removeCourse();
       }
   });
}

let currentCourseLayerId = null;

// コースを表示する関数
function displayCourse(course) {
   // 既存のコースを削除
   if (currentCourseLayerId) {
       if (map.getLayer(currentCourseLayerId)) {
           map.removeLayer(currentCourseLayerId);
       }
       if (map.getSource(currentCourseLayerId)) {
           map.removeSource(currentCourseLayerId);
       }
   }

   // サーバーサイドからルートを取得
   getRoute(course.coordinates)
       .then(routeGeoJson => {
           // 新しいソースとレイヤーを追加
           currentCourseLayerId = 'course-route';
           map.addSource(currentCourseLayerId, {
               type: 'geojson',
               data: routeGeoJson
           });

           map.addLayer({
               id: currentCourseLayerId,
               type: 'line',
               source: currentCourseLayerId,
               layout: {
                   'line-join': 'round',
                   'line-cap': 'round'
               },
               paint: {
                   'line-color': '#FF0000',
                   'line-width': 4
               }
           });

           // マップの表示範囲をコースに合わせる
           const bounds = new maplibregl.LngLatBounds();
           routeGeoJson.features[0].geometry.coordinates.forEach(coord => bounds.extend(coord));
           map.fitBounds(bounds, { padding: 50 });
       })
       .catch(error => console.error('Error getting route:', error));
}

// コースを削除する関数
function removeCourse() {
   if (currentCourseLayerId) {
       if (map.getLayer(currentCourseLayerId)) {
           map.removeLayer(currentCourseLayerId);
       }
       if (map.getSource(currentCourseLayerId)) {
           map.removeSource(currentCourseLayerId);
       }
       currentCourseLayerId = null;
   }
}

// ルートを取得する関数
function getRoute(coordinates) {
   return fetch('/calculate_route', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({ waypoints: coordinates })
   })
   .then(response => response.json())
   .then(data => {
       if (data.error) {
           throw new Error(data.error);
       }
       // GeoJSON形式に変換
       const routeGeoJson = {
           type: 'FeatureCollection',
           features: [
               {
                   type: 'Feature',
                   geometry: {
                       type: 'LineString',
                       coordinates: data.route
                   }
               }
           ]
       };
       return routeGeoJson;
   });
}
});