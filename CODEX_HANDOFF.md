# Codex引き継ぎメモ

更新日: 2026-05-24

## 対象

- リポジトリ: `k5610018-satoshin/jikanwari`
- ローカル: `C:\Users\K5610\jikanwari-app`
- 公開URL: `https://k5610018-satoshin.github.io/jikanwari/`

## 今回Codexが直したこと

- 日課を「日ごと」ではなく「週全体」で切り替える仕様へ変更。
- `日課・水泳` ドロワーに次の2系統を分離。
  - `週全体の日課`: 通常 / 教育相談 / 個人懇談
  - `日ごとの4時間授業`: 行事などの例外日だけ4時間化
- 教育相談は週全体で適用し、5・6時間目は消さない。
- 教育相談時は左側の校時時刻も次へ変更。
  - 1限 `8:45-9:25`
  - 2限 `9:35-10:15`
  - 3限 `10:40-11:20`
  - 4限 `11:30-12:10`
  - 5限 `13:20-14:05`
  - 6限 `14:15-15:00`
- 教育相談週に一部の日だけ4時間例外を入れても、左側の時刻は教育相談時程のまま。
- 既存データ移行を追加。
  - 過去版で全曜日が教育相談/個人懇談として保存されていた週は、週全体の日課として正規化。
  - 1日だけ4時間の例外は `4時間` として保持。
- 宿題の初期値を `けテぶれ` に変更。
- 児童ビューは週表示だけに固定し、閲覧URLに `week=YYYY-MM-DD` を含める。
- 児童ビュー上部の週範囲ラベル（例: `6/8（月）〜 6/12（金）`）は非表示。日付は各曜日ヘッダー内だけに表示。
- QRから開く児童ビューは白背景・高コントラスト文字に固定。OSのダークモードに引っ張られないよう `color-scheme: light` を指定。
- 印刷プレビュー/印刷PDFの表罫線を強化。
- 設定・Excel取り込みドロワーの閉じ残り/見切れを修正。
- Service Workerを更新し、HTMLはネット優先取得に変更。キャッシュ名は `jikanwari-v5-20260524`。

## 主な実装箇所

- `index.html`
  - `SCHEDULES`
  - `migrate()`
  - `normalizeWeekSchedule(wk)`
  - `weekSchedule(wk)`
  - `setDaySchedule(wk,d,schedule,override)`
  - `applyWeekSchedule(schedule)`
  - `periodTimeLabel(wk,d,p)`
  - `weekPeriodTimeLabel(wk,p)`
  - `buildSchedGrid()`
  - `buildShortDayGrid()`
  - `toggleShortDay(d)`
- `sw.js`
  - cache version更新
  - navigate/htmlリクエストをネット優先へ

## 検証済み

- JS構文チェックOK。
- 週全体を教育相談にすると、PC週表左側の時刻が教育相談時程に変わる。
- 教育相談で5・6時間目がある曜日は5・6時間目が残る。
- 教育相談週で火曜だけ4時間にしても、左側時刻は教育相談時程のまま。
- 日ごとの4時間例外では、その日だけ5・6時間目が非表示になる。
- スマホ日表示でも教育相談の時刻が反映される。
- 児童ビューは週表示のみ。
- 公開時はService Workerキャッシュ更新が必要なため、URLに `?v=<commit>` を付けると確認しやすい。

## Claude Codeへの注意

- 週全体の日課は、各日の `scheduleOverride=false` として保存している。
- 日ごとの4時間例外は、対象日の `schedule="4時間"`、`scheduleOverride=true`、`periodsCount=4` として保存している。
- `weekSchedule(wk)` は `scheduleOverride=true` の日を週日課判定から除外する。
- `4時間` は週全体の日課選択には出さない。例外日専用。
- `個人懇談` は週全体の日課として使う。
- 実機iPhoneでPWAを開いている場合、古いService Workerが一度残ることがある。`?v=<最新commit>` 付きURLで開くか、アプリを完全終了して再起動する。
