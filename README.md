# HarrisLi 美股追蹤表

讀取「美股追蹤表_harrisli」Google 試算表，在瀏覽器裡計算本金匯率成本、個股成本與損益，並提供年度篩選的分析圖表。
計算規則和試算表的成本計算腳本 v2 相同。整個網站只有一個 `index.html`，不需要建置工具。

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | 網站本體（含所有樣式與程式） |
| `webapp.gs` | 選用。貼到試算表的 Apps Script，讓試算表保持私人也能讀取 |
| `.nojekyll` | 讓 GitHub Pages 直接提供檔案 |

## 部署到 GitHub Pages

1. 在 GitHub 建立新的 repository（例如 `us-tracker`）。
2. 上傳 `index.html`、`webapp.gs`、`.nojekyll`、`README.md`。
3. 到 repository 的 **Settings → Pages**：Source 選 **Deploy from a branch**，Branch 選 `main`、資料夾 `/ (root)`，按 Save。
4. 約一分鐘後，網站會出現在 `https://<你的帳號>.github.io/<repository 名稱>/`。

不想放上 GitHub 的話，直接用瀏覽器開啟 `index.html` 也可以使用。

## 設定資料來源

開啟網站後按右上角 **資料來源**，選一種方式，按 **儲存並載入**。設定只存在該瀏覽器，不會寫進 repository。

### 方式一：Google 試算表網址（最簡單）

1. 在試算表按 **共用 → 一般存取權 → 知道連結的任何人 → 檢視者**。
2. 把試算表網址貼到「試算表網址或 ID」。

注意：任何拿到網址的人都能看到試算表內容。

### 方式二：Apps Script 網頁應用程式（試算表維持私人，建議）

1. 試算表 → **擴充功能 → Apps Script** → 新增檔案 `webapp`，貼上 `webapp.gs` 全部內容。
2. 把 `WEBAPP_API_KEY` 改成你自己的一組長字串。
3. **部署 → 新增部署作業 → 網頁應用程式**，執行身分「我」、誰可以存取「任何人」，第一次會要求授權。
4. 把產生的 `…/exec` 網址與金鑰填到網站的「Apps Script 網頁應用程式」。

之後修改 `webapp.gs`，要到 **部署 → 管理部署作業 → 編輯 → 新版本** 才會生效。

### 方式三：上傳 .xlsx

試算表 **檔案 → 下載 → Microsoft Excel (.xlsx)**，在網站選這個檔案。資料只在瀏覽器裡解析。

## 顯示名稱

頁面標題預設是「美股追蹤表」。在 **資料來源 → 顯示名稱** 填入名字（例如 HarrisLi），標題就會變成「HarrisLi 美股追蹤表」，只套用在自己的瀏覽器。
標題上方的小字會自動顯示試算表檔名（Apps Script 需使用最新版 `webapp.gs` 並部署新版本；上傳 .xlsx 時顯示檔名）。

## 改成預設值（選用）

`index.html` 裡的 `SITE_CONFIG` 可以設定預設來源，例如：

```js
const SITE_CONFIG = {
  owner: '',             // 預設顯示名稱
  source: 'gas',
  sheet: '',
  gasUrl: 'https://script.google.com/macros/s/xxxx/exec',
  gasKey: '',            // 金鑰不要寫在公開的 repository，改在網頁上輸入
  sheets: { tx: '股票', px: '現價查詢', cap: '本金' },
  fxCell: 'I3',
  auto: true
};
```

公開的 repository 任何人都看得到 `index.html` 的內容，所以不要把金鑰或公開分享的試算表網址寫在這裡。

## 試算表格式

| 分頁 | 欄位 |
|---|---|
| 股票 | A 日期（MM/DD/YYYY）、B 代號、C 操作、D 數量、E 價格 |
| 現價查詢 | A 代號、B 現價、C 本益比、D Beta |
| 本金 | A 日期、B 匯入美元、C 匯率、D 手續費（台幣）；I3 即時匯率 |

操作支援：Buy、Sell、Dividend、Tax、Sell Call / Sell Put、Buy Call / Buy Put、Split、Reverse Split（與中文同義詞）。

## 類型分類

槓桿／反向與 ETF 的清單寫在 `index.html` 的 `LEV` 與 `ETF`，新增標的時可以自行加入。
