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
    print('Received data:', data)

    # Amazon Location Serviceにリクエストを送信
    response = requests.post(
        'https://routes.geo.ap-southeast-2.amazonaws.com/routes/v0/calculators/MyRouteCalculator/calculate',
        headers={
            'Content-Type': 'application/json',
            'x-amz-api-key': 'v1.public.eyJqdGkiOiI3NGU3ZmZjYi1jZTUwLTRlYzYtOGI1Zi03NWZmNjM2ZDU2YjgifTexIKk4-JXNEsgmAcYZVFJ3yfS8eNAjy4Ry_Au8YaRaO-vVl8-4j_kMGr9wat0V6JxWhDa53Pox9GEbliW0Iuh-s1PprMhPKFteUjdRz4cB5OC75_1e9MCeP1yj9AzWo8asFLklUAr7nmvJSocHjqXltuyTYe4NoeBcYk1Fmn_ztAaR1dxDp47k4lsG2rQLoaHboNJRvGAv_2MS5wT4iEaCd6dbg_JQEzjJb0LYOBmiiWoOW7iy1mQwOCPw5wBKx9ElpLPiCecCv_nStr1r0qEHj1mNwj9wekj3HyeYp67C5Vry5wIkUbsdBM8zFtbQKqcOAPAc3wns9H92mOoLxoU.ZTA2OTdiZTItNzgyYy00YWI5LWFmODQtZjdkYmJkODNkMmFh'  # ルート計算用のAPIキーを設定
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