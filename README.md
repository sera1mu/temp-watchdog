# temp-watchdog

temp-watchdog は、DHT22の温度と湿度を、監視、CSVやGoogle Sheetsに記録してくれるプログラムです。

## Requirements

- Node.js v14.x.x
- Yarn v1

※これ以外の環境でも動作するかもしれませんが、保証はできません。

## Install

1. リポジトリをクローン

```sh
$ git clone git@github.com:sera1mu/temp-watchdog.git
```

2. 依存パッケージをインストール

```sh
$ cd temp-watchdog
$ yarn install
```

3. ソースコードをビルド

```sh
$ yarn build
```

4. コンフィグを書く

詳しくは [Configuration](#Configuration)を参照。

5. 起動

```sh
# dist/run.js :: 一度だけ実行します
$ CONFIG_FILE="<コンフィグファイルのパス>" node dist/run.js
# dist/daemon.js :: 定期的に指定された間隔(cronExpression)で実行します
$ CONFIG_FILE="<コンフィグファイルのパス>" node dist/daemon.js
```

## Configuration

```toml
# DHT22のGPIOピン番号
pinNumber = 4
# daemon.jsを使用する場合のcron式
# ここでは10分ごとに実行するように設定
cronExpression = "0,10,20,30,40,50 * * * *"

# Google Sheets 関連の設定
[googleSheets]
# Google Sheetsへの記録をする
enable = false
# 記録するシートのID
sheetId = "1cfAtg..."
# シートのタイトルのフォーマット 日時(YYYY,MM)などを埋め込むことができます
sheetTitleFormat = "YYYY-MM-温湿度" # 2021-05-温湿度
# GCPのサービスアカウントの鍵
credentialsFile="credentials.json"

# CSV 関連の設定
[csv]
# CSVへの記録をする
enable = false
# CSVファイルの保存ディレクトリ
saveDirectory = "/home/pi/csv"
# CSVファイル名のフォーマット 日時(YYYY,MM)などを埋め込むことができます
fileNameFormat = "温湿度-YYYY-MM.csv" # 温湿度-2021-05.csv
```

## Demo

私(@sera1mu)の家の温湿度をGoogle Sheetsで公開しています:
https://docs.google.com/spreadsheets/d/1cfAtgVc57LX22bP9AJmq5upZuESaCHVqtUChlO003FU/edit?usp=sharing
