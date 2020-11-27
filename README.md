# ロボカップジュニア RoboCupJunior CMS
### Competition Management System
#### (former Rescue Scoring System)
This is a Competition Management System used in RoboCupJunior's rescue line & maze competitions in word wide.
Please refer to the [English version README](https://github.com/rrrobo/rcj-rescue-scoring-japan/blob/master/README-EN.md) for details.

--

### 大会管理システム(CMS)
#### (旧：レスキュー　スコアリングシステム)
これは，ロボカップジュニアレスキュー競技で用いられる大会管理システムです．  

#### 対応ルール
ワールドリーグ Line/Maze:2020  
日本リーグ：2021

--


[大元のプロジェクト](https://github.com/TechnoX/rcj-rescue-scoring)からフォークして開発を進めています．
主な変更点は以下の通りです．

* Line競技において，ワールドリーグと日本リーグを追加
* Line結果画面において，ワールドリーグと日本リーグの結果を横並びで表示
* ユーザー管理機能を強化
* マップの回転機能を追加
* インタビュー機能を追加
* 2020ルールに対応
* ラインのタイルセットの在庫管理に対応
* 大会データーのバックアップ/リストアに対応
* トラブル発生時のハンドオーバーに対応
* 紙のスコアシートの出力に対応
* ドキュメント提出/レビューシステムを統合
* システムからのメール配信が可能

特別な理由がない限り，本リポジトリで提供しているバージョンを使用することをお勧めします．

## 動作デモ
最新バージョンが稼働しています．Dockerイメージを利用して構築しています．

[https://rcj.cloud](https://rcj.cloud)

## 更新情報
* [2020/11/28] ドキュメント系システムを本システムに統合しました．また，システムからのチームへのメール配信も可能になりました．
* [2020/02/10] v20系にて2020ルールに対応しました．
* [2019/07/17] スコアシートを出力できるようになりました．
* [2019/03/19] 大会データをバックアップを取ることができるようになりました．また，トップページのUIを大幅に変更しました．
* [2018/10/24] v.19系にて，2019ルールに対応しました．v.19系では，2018ルールに後方互換性があります．


## 使用実績
**把握している限り**の，本システムを用いて運用を行った主な大会の一覧です．派生バージョンの使用も含みます．
### 2016年ルール対応版
* スウェーデン国内大会
* ロボカップジュニア2017 関東ブロック大会
* ロボカップジュニア ジャパンオープン2017 ぎふ・中津川

### 2017年ルール対応版
* RoboCup 2017 Nagoya Japan
* NESTロボコン2017
* ロボカップジュニア2018 北埼玉ノード大会
* ロボカップジュニア2018 南埼玉ノード大会
* ロボカップジュニア2018 千葉ノード大会
* ロボカップジュニア2018 広島ノード大会
* ロボカップジュニア2018 大阪中央ノード大会
* ロボカップジュニア2018 埼玉ブロック大会
* ロボカップジュニア2018 関東ブロック大会
* ロボカップジュニア2018 広島ブロック大会
* ロボカップジュニア2018 関西ブロック大会
* ロボカップジュニア　ジャパンオープン2018 和歌山

### 2018年ルール対応版
* RoboCup 2018 Montreal Canada
* 関西ブロック 夏のオープン大会2018

### 2019年ルール対応版
* ロボカップジュニア2019 東海ブロック大会
* ロボカップジュニア2019 埼玉ブロック大会
* ロボカップジュニア2019 広島ブロック大会
* ロボカップジュニア2019 大阪中央ノード大会
* ロボカップジュニア2019 関西ブロック大会
* ロボカップジュニア2019 関東ブロック大会
* ロボカップジュニア ジャパンオープン2019 和歌山
* RoboCup 2019 Sydney Australia
* ロボカップジュニア2020 大阪中央ノード大会
* ロボカップジュニア2020 関西ブロック大会

## 使用方法
### Dockerを利用（推奨）
[公式Dockerイメージ](https://hub.docker.com/r/ryorobo/rcj-rescue-scoring-japan)を用意しています．本イメージからの利用を推奨します．
また，環境構築用の[ヘルパーファイル](https://github.com/rrrobo/rcj-scoring-docker)も用意しています．


### Dockerを利用しない構築
#### 主な必要なソフト
* [Node.js](https://nodejs.org/en/)
* [mongodb](https://www.mongodb.com)
まず，この２つをインストールする．

### bowerのインストール
`sudo npm install -g bower`

### 各種依存関係の導入
ディレクトリ内で...
`npm install`
`bower install`
`npm run build`

### ログ用ディレクトリの作成
`mkdir logs`

### 起動
`node server`

## 初期アカウント
初期アカウントは次の通りです．  

ユーザー名        | パスワード         |
----------------|-------------------|
admin | adminpass   |

## メールの使用設定
システムからメールを配信するには，使用するSMTPサーバ等の情報を設定する必要があります．
次の内容を `process.env`　に追記してください．
設定内容は，各自の環境に合わせて変更してください．このままコピペしても動きません！

MAIL_SMTP=smtp.example.com  
MAIL_PORT=587 
MAIL_USER=smtp_user  
MAIL_PASS=smtp_password  
MAIL_FROM=fromAddress@example.com  
MAIL_SENDER=RoboCupJunior Japan  

## 詳しい使用方法
[RCJ Scoring System Community Forum](https://ask.rcj.cloud)をご覧ください．  
現時点では，原則として，本フォーラムへのアクセスを各地の大会実行委員に相当する方に限定しています．  
アクセスを希望される場合は，各ブロックのレスキュー技術委員にご相談ください．

## 主な画面例
*旧バージョンの情報を含みます．

トップ画面(2019)
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/1.png">
<hr>
ログイン画面  
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/6.png">
<hr>
Line 競技一覧  
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/2.png">
<hr>
Line 審判1  
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/3.png">
<hr>
Line 審判2  
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/4.png">
<hr>
Line 確認  
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/5.png">
<hr>
Maze 審判  
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/7.png">
<hr>

### 効果音
以下の効果音を使用しています．

* [MusMus](http://musmus.main.jp)
* [魔王魂](https://maoudamashii.jokersounds.com)
