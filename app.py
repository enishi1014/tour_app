from flask import Flask, render_template, jsonify, request
import json
import requests
from flask_cors import CORS  # CORSのインポート
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
CORS(app)  # 全てのオリジンからのリクエストを許可
csrf = CSRFProtect(app)

@app.route('/')
def index():
    # ダミーのポイントデータ
    temples = {'point': 100}
    return render_template('index.html', temples=temples)

# マップデータを提供するAPI
@app.route('/route', methods=['POST'])
@csrf.exempt  # このエンドポイントだけCSRF保護を無効にする
def route():
    # クライアントから送られてきたデータを取得
    data = request.json

    # Amazon Location Serviceにリクエストを送信
    response = requests.post(
        'https://routes.geo.ap-southeast-2.amazonaws.com/routes/v0/calculators/MyRouteCalculator/calculate',
        headers={
            'Content-Type': 'application/json',
            'x-amz-api-key': 'v1.public.eyJqdGkiOiI0ZDhjNjIzYS04MmI2LTQ5M2MtYTg5Yy1mOTBhYTA2MDgwZDMifQSdAHIvgipgpQjkU9-AA60dfiy5xV3SPaObYWmyG2N13qnvSfioPEgIIvdDhlQa9SXi9fWTyid3JmNDX6k-oERVToACPMtiShr31cxQKDtmZCii_z7KisaQeln6acJBTbnoAcbufoCbJq_SFTTiC9ItVSghkD3IHL6s7v1ibs5ub_Bh9CbNO2wlHcjcLbjSHYmTU6tOkdInoIM6YAxktERiD9PcY6Cms3o_kP6-oEP4urJtZI8tGxUNzJICS_IDN0OImY4jNhvGNkzwuxN9AH8v7ve6vBpcBY91rz2mrGDofrGJ3huSWZPXWz4xyYmWzdY6J-9UZ5Age8PVCqxVLbQ.ZTA2OTdiZTItNzgyYy00YWI5LWFmODQtZjdkYmJkODNkMmFh'  # ルート計算用のAPIキーを設定
        },
        json=data
    )

    # Amazon Location Serviceからのレスポンスをそのままクライアントに返す
    if response.ok:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to calculate route'}), response.status_code


if __name__ == '__main__':
    app.run(debug=True)