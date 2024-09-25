from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

@app.route('/')
def index():
    # ダミーのポイントデータ
    temples = {'point': 100}
    return render_template('index.html', temples=temples)

# マップデータを提供するAPI
@app.route('/api/map_data', methods=['GET'])
def get_map_data():
    # マップ表示に必要なデータを返す（ダミーデータ）
    data = {
        'locations': [
            {'name': 'スポットA', 'coordinates': [139.7000, 35.6895]},
            {'name': 'スポットB', 'coordinates': [139.7020, 35.6900]}
        ]
    }
    return jsonify(data)

# ルート提案データを提供するAPI
@app.route('/api/routes', methods=['GET'])
def get_routes():
    # ユーザーの好みに応じたルートを返す（ダミーデータ）
    with open('routes.json', 'r', encoding='utf-8') as f:
        routes = json.load(f)
    return jsonify(routes)

if __name__ == '__main__':
    app.run(debug=True)
