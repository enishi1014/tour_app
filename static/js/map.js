document.addEventListener('DOMContentLoaded', async function () {
    // マップ表示用のAPIキー
    const mapApiKey = "v1.public.eyJqdGkiOiIyYWQwZjQyZC0yMGYwLTQ4YjMtYjUzZi0xOGExOTNkYmUyMjgifU6af6Qz2TVFmHlhyA7gUEva5beeXEdF9d4qG_AGhh8qDtsswJARPgkK3M2MyPIaBBXOBsyeb0dbQkVqZrLRawRv7f_X_Wopago5eD85jDLG47Z-4BJScO95XkpWO5MwtN26mHIl0G-QaktNy8rs9tVpGxKeoqycjmJ_6FN6nU_PpTSatGpkWto4GLH1oLv3wZw_cRw3HgM9z7YsDy02-TQz9q3TRrAIKLIpRdpwvkKDtkubn-eFw1a9yrPXTuNmgjaTkCtQGekQkGZfkVNMy0J6KRSzzQBSx7WGvpjxJI2uE7sJap94BwvSYbM_9SLKzvP6rQr6_mLuIc50lzE24xI.ZTA2OTdiZTItNzgyYy00YWI5LWFmODQtZjdkYmJkODNkMmFh"; // マップ用のAPIキーに置き換える
    const mapName = "mymap";
    const mapRegion = "ap-southeast-2";

    // ルート計算用のAPIキー
    const routeApiKey = "v1.public.eyJqdGkiOiI0ZDhjNjIzYS04MmI2LTQ5M2MtYTg5Yy1mOTBhYTA2MDgwZDMifQSdAHIvgipgpQjkU9-AA60dfiy5xV3SPaObYWmyG2N13qnvSfioPEgIIvdDhlQa9SXi9fWTyid3JmNDX6k-oERVToACPMtiShr31cxQKDtmZCii_z7KisaQeln6acJBTbnoAcbufoCbJq_SFTTiC9ItVSghkD3IHL6s7v1ibs5ub_Bh9CbNO2wlHcjcLbjSHYmTU6tOkdInoIM6YAxktERiD9PcY6Cms3o_kP6-oEP4urJtZI8tGxUNzJICS_IDN0OImY4jNhvGNkzwuxN9AH8v7ve6vBpcBY91rz2mrGDofrGJ3huSWZPXWz4xyYmWzdY6J-9UZ5Age8PVCqxVLbQ.ZTA2OTdiZTItNzgyYy00YWI5LWFmODQtZjdkYmJkODNkMmFh"; // ルート計算用のAPIキーに置き換える
    const calculatorName = "MyRouteCalculator"; // 作成したルート計算機の名前に置き換える
    const routeRegion = "ap-southeast-2";

    // MapLibreのマップ表示の初期化
    const map = new maplibregl.Map({
        container: "map",
        style: `https://maps.geo.${mapRegion}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${mapApiKey}`,
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
        .catch(error => console.error('モデルコースの読み込み中にエラーが発生しました:', error));

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
    async function displayCourse(course) {
        // 既存のコースを削除
        if (currentCourseLayerId) {
            if (map.getLayer(currentCourseLayerId)) {
                map.removeLayer(currentCourseLayerId);
            }
            if (map.getSource(currentCourseLayerId)) {
                map.removeSource(currentCourseLayerId);
            }
        }

        // 経路を取得する
        try {
            const routeGeoJson = await getRoute(course.coordinates);

            // 新しいソースとレイヤーを追加
            currentCourseLayerId = 'course-route';
            map.addSource(currentCourseLayerId, {
                type: 'geojson',
                data: routeGeoJson,
            });

            map.addLayer({
                id: currentCourseLayerId,
                type: 'line',
                source: currentCourseLayerId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#FF0000',
                    'line-width': 4,
                },
            });

            // マップの表示範囲をコースに合わせる
            const bounds = new maplibregl.LngLatBounds();
            routeGeoJson.features[0].geometry.coordinates.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds, { padding: 50 });

        } catch (error) {
            console.error('ルート計算中にエラーが発生しました:');
            console.error('エラーメッセージ:', error.message);
            console.error('スタックトレース:', error.stack);
        }
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
    async function getRoute(waypoints) {
        // 各経路区間のルートを取得し、結合する
        let allCoordinates = [];

        for (let i = 0; i < waypoints.length - 1; i++) {
            const departure = waypoints[i];
            const destination = waypoints[i + 1];

            const response = await fetch('/route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    DeparturePosition: departure,
                    DestinationPosition: destination,
                    TravelMode: 'Car'
                })
            });

            if (!response.ok) {
                throw new Error('ルート計算に失敗しました');
            }

            const data = await response.json();
            const coordinates = data.Legs[0].Geometry.LineString;

            // 最初の区間以外は先頭の座標を削除（重複を避けるため）
            if (i > 0) {
                coordinates.shift();
            }

            allCoordinates = allCoordinates.concat(coordinates);
        }

        // GeoJSON形式に変換
        const routeGeoJson = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: allCoordinates,
                    },
                },
            ],
        };

        return routeGeoJson;
    }
});
