# DINO AI 數學遊樂園

<img src="icon.png" alt="DINO AI 數學遊樂園" width="160">

國小到國中數學的遊戲式學習頁面,繁體中文與英文兩個版本,共 440 個單元遊戲。純靜態網頁,語音使用預先錄製的音檔。

## 語言版本

| 版本 | 這個儲存庫 | 位置 |
|---|---|---|
| 繁體中文＋英文 | 有 | `zh/index.html`(繁體)、`en/index.html`(英文),頁面上有切換按鈕 |
| 簡體中文＋英文 | **尚未製作** | 遊樂園目前沒有簡體版。同系列已有簡體＋英文版的是四則運算表與基礎幾何,見下方「相關儲存庫」 |

## 連結

線上預覽(GitHub Pages,不需要 GitHub 帳號):

- 入口(自動轉到繁體版):https://claudecat30-sys.github.io/newmathpark/
- 繁體中文版:https://claudecat30-sys.github.io/newmathpark/zh/index.html
- 英文版:https://claudecat30-sys.github.io/newmathpark/en/index.html

下載:

- 儲存庫:https://github.com/claudecat30-sys/newmathpark
- 整包 ZIP(約 1.6 GB):https://github.com/claudecat30-sys/newmathpark/archive/refs/heads/main.zip
- 用 git:`git clone https://github.com/claudecat30-sys/newmathpark.git`

其他:

- 製作紀錄:https://github.com/claudecat30-sys/newmathpark/tree/main/docs
- 更新歷程:https://github.com/claudecat30-sys/newmathpark/commits/main

### 相關儲存庫

同一系列的其他產品,各自獨立,不在這個儲存庫裡。

| 產品 | 語言版本 | 儲存庫 | 線上預覽 |
|---|---|---|---|
| 新課綱數學(課程版) | 繁體中文＋英文(簡體中文＋英文尚未製作) | https://github.com/claudecat30-sys/newmath | https://claudecat30-sys.github.io/newmath/ |
| 四則運算表 | 繁體中文＋英文、簡體中文＋英文 | https://github.com/claudecat30-sys/arithmetic-tables | 繁體 https://claudecat30-sys.github.io/arithmetic-tables/ 、簡體 https://claudecat30-sys.github.io/arithmetic-tables/cn.html |
| 基礎幾何 | 繁體中文＋英文、簡體中文＋英文 | https://github.com/claudecat30-sys/basic-geometry | 繁體 https://claudecat30-sys.github.io/basic-geometry/ 、簡體 https://claudecat30-sys.github.io/basic-geometry/cn.html |

## 內容

```
index.html          入口,自動轉到繁體版
icon.png            產品圖示(頁面的 favicon 也用這張)
start.bat           本機測試用(需要 Python)
zh/
  index.html        繁體中文版頁面
  audio/            音檔 95,860 個(約 1.32 GB)與索引 index.js
en/
  index.html        英文版頁面
  en-rules.js       英文讀音規則表(頁面播放時會用到,必須一起上傳)
  audio/            音檔 13,884 個(約 201 MB)與索引 index.js
docs/               製作過程的紀錄(讀音規則、修正紀錄、錄音對照)
```

## 部署

1. 把整個資料夾原樣放到網站上,**保持目錄結構**。`zh/` 和 `en/` 必須在同一層,兩個版本的切換按鈕才會運作。
2. 用網址開啟,例如 `https://網域/路徑/index.html`。
3. **不要直接雙擊本機的 html 檔**:瀏覽器不允許本機頁面讀取同資料夾的音檔,語音會退回瀏覽器內建語音。這不是檔案錯誤。

本機測試:雙擊 `start.bat`,或在這個資料夾執行 `python -m http.server 8003` 後開啟 `http://localhost:8003/index.html`。

### 可能需要調整的地方

| 項目 | 位置 | 說明 |
|---|---|---|
| 語言切換的網址 | 兩個 `index.html` 裡的 `LANG_SWITCH_URL` 那一行 | 目前是 `../zh/index.html` 與 `../en/index.html`。目錄結構不同時改這一行 |
| 圖示 | `icon.png` | 兩個頁面的 `<head>` 以 `../icon.png` 引用 |
| 音檔路徑 | 頁面以相對路徑 `audio/檔名.mp3` 讀取 | 若音檔要放 CDN,需修改頁面裡組合網址的地方(搜尋 `'audio/'+`) |

## 介面

目前的介面只有「遊樂園」:年級 → 單元卡片 → 遊戲頁(標題、玩法、故事)→ 遊戲,另有能力分析與競賽。

頁面裡還保留了閱讀、動畫、動手做、測驗等課程分頁的程式與內容,但以樣式規則 `body.hubOn>header, body.hubOn>main{display:none!important}` 隱藏,介面上沒有入口。這是目前的產品決定,不是錯誤。

## 語音

- 繁體版:Azure `zh-TW-HsiaoChenNeural`。英文版:Azure `en-US-SaraNeural`,語速 0.80。
- 音檔已去除前後靜音。
- `audio/index.js` 會設定 `window.AUDIO_INDEX`,是「文字 → 音檔檔名」的對照表。
- 固定句子是整句一個音檔;帶數字的句子由頁面把「文字片段」和「數字」的音檔依序播放拼起來。
- 找不到音檔的句子會退回瀏覽器內建語音。英文版會在瀏覽器主控台印出 `[沒有預錄音檔，改用瀏覽器語音]`,方便追查。
- 首頁副標題下方有語速選單,設定存在使用者的瀏覽器(`localStorage`)。
- 這個儲存庫不含任何 API 金鑰,也不含錄音程式。

英文讀法由 `en/en-rules.js` 決定(符號、單位、分數、圖示名稱等)。要改某個讀法時改這個檔案,並重錄受影響的音檔;細節見 `docs/英文版說明.md` 與 `docs/英文數學讀音規則.md`。

## 需要後端才能運作的功能

頁面原本是在 claude.ai 的 artifact 環境開發的,以下功能會呼叫該環境提供的服務(`window.claude`),放在一般網站上會自動停用,不會出錯:

- 線上排行榜
- 即時連線對戰
- 成績下載會改用瀏覽器的一般下載

要啟用排行榜與對戰,需要另外建置會員登入、分數資料庫與即時連線,並把頁面裡對 `claude.use('db' | 'user' | 'room')` 的呼叫改接到自家後端。

## 會員與音檔保護

這是純靜態網站,登入只能做在前端,擋不住直接下載。任何人知道 `audio/` 底下的網址就能取得 mp3。若要保護內容,需由後端在登入後發放存取權(例如簽章網址)。頁面目前沒有登入功能。

## 資料儲存

遊戲紀錄、玩家名稱、語速設定都存在使用者瀏覽器的 `localStorage`,不會上傳。兩個語言版本放在同一個網域時,紀錄是共用的。

## 已知限制

1. **音檔沒有逐句人工試聽。** 讀音是依規則由程式判讀後合成的,已做程式比對與抽樣操作測試。
2. **隨機題目不是窮舉。** 遊戲題目是隨機產生的。製作時以自動試玩收集句子並補齊音檔(繁體版約 9 萬句、英文版約 6 萬句檢查通過),沒抽到的組合仍可能退回瀏覽器語音。
3. **拼接的接縫。** 帶數字的句子在數字前後會有輕微停頓。
4. **英文版沒有預錄的部分:** 開啟 Translation 後顯示的中文、點英文單字查字義的發音。
5. **手機與平板尚未實機測試。** 語音以 Web Audio 播放以避開自動播放限制,需測試 iPhone 靜音開關、切換分頁後的行為。
6. **容量:** 音檔約 1.6 GB、10 萬多個檔案,上傳與部署需要時間。
7. `docs/` 裡的文件是製作過程的工作紀錄,部分連結指向製作時的本機路徑,在這裡打不開。

## 更新紀錄

### 2026-11-19

- 兩版頂端列加入全螢幕切換按鈕(`#hFs`,在語言切換按鈕左邊;頁面裡標記為 `fullscreen-toggle-v1`)。瀏覽器不支援全螢幕時(例如 iPhone 的 Safari)按鈕不會出現。尚未在實體平板測試。
- 說明頁加入語言版本、預覽與下載連結、相關儲存庫。

### 2026-11-16

- 繁體版讀法:算式的括號念「括號」;`%` 念「趴」;句子中間代表未知數的 `?` 念「多少」;「數」當動詞(數一數、往後數、5 個一數)念 ㄕㄨˇ,字幕注音同步修正。
- 英文版讀法:`en/en-rules.js` 更新(5s 讀 fives、日期、負數括號、f(x) 讀 f of x、h/min/s 單位、分數與指數等),遊戲用到的音檔改用依新規則重錄的版本。
- 兩版共同:直式分數(上下疊的寫法)不再念成連在一起的數字;`audio/index.js` 的 script 標籤加上 `charset="utf-8"`;加入 iPhone / iPad 的音訊解鎖(頁面裡標記為 `iOS-voice-fix-v2`)。
- 不再使用的舊音檔已刪除,所以這次更新同時有新增與刪除的檔案。

取得更新:用 git 下載的人執行 `git pull` 即可,只會傳輸有變動的檔案;用 Download ZIP 下載的人需要整包重新下載。
