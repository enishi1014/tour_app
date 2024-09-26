from flask import Flask, render_template, jsonify, request
import json
import requests
from flask_cors import CORS  # CORSのインポート
from flask_wtf.csrf import CSRFProtect
from flask import Flask, render_template, jsonify, request
import boto3
import math
import os
import json
from dotenv import load_dotenv

# .env ファイルから環境変数をロード
load_dotenv()

app = Flask(__name__)

# AWS SDK (Boto3) でのクライアント作成
client = boto3.client('location', region_name=os.getenv('AWS_REGION'))

# スポットデータのロード (JSONファイルから)
with open('static\data\model_courses.json', 'r', encoding='utf-8') as f:
    routes_data = json.load(f)
# ハバーサインの公式による距離計算
def haversine_distance(coord1, coord2):
    R = 6371.0  # 地球の半径 (km)
    lat1, lon1 = math.radians(coord1[1]), math.radians(coord1[0])
    lat2, lon2 = math.radians(coord2[1]), math.radians(coord2[0])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

# 出発点を固定してスポットを並び替え
def sort_spots(start, spots):
    route = [start]
    remaining_spots = spots.copy()

    while remaining_spots:
        nearest_spot = min(remaining_spots, key=lambda spot: haversine_distance(route[-1], spot))
        route.append(nearest_spot)
        remaining_spots.remove(nearest_spot)

    return route

@app.route('/')
def index():
    # ダミーのポイントデータ
    temples = {'point': 100}
    return render_template('index.html',routes=routes_data, temples=temples)

# マップデータを提供するAPI

@app.route('/calculate-route', methods=['POST'])
def calculate_route():
    try:
        route_id = request.json.get('route_id')
        route = routes_data.get(route_id)

        if not route:
            return jsonify({'error': 'Invalid route ID'}), 400

        spots = route['spots']
        sorted_spots = sort_spots(spots[0], spots[1:-1])  # 出発点と中間地点を並び替え
        sorted_spots.append(spots[-1])  # 終点を追加

        response = client.calculate_route(
            CalculatorName=os.getenv('ROUTE_CALCULATOR_NAME'),
            DeparturePosition=sorted_spots[0],  # 出発地点
            DestinationPosition=sorted_spots[-1],  # 終点
            WaypointPositions=sorted_spots[1:-1],  # 中間地点
            IncludeLegGeometry=True
        )

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)