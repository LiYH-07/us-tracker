/**
 * 美股追蹤表 網頁應用程式（webapp.gs）
 * 讓 GitHub 上的「HarrisLi 美股追蹤表」頁面讀取試算表資料，試算表本身維持私人。
 *
 * 安裝：
 *  1. 在試算表開啟「擴充功能 → Apps Script」，按「＋」新增一個檔案，命名 webapp，貼上本檔內容。
 *  2. 把下方 WEBAPP_API_KEY 改成一組你自己的長字串（頁面上要輸入同一組）。
 *  3. 右上「部署 → 新增部署作業」，類型選「網頁應用程式」：
 *       執行身分：我
 *       誰可以存取：任何人
 *  4. 複製「網頁應用程式網址」（…/exec），貼到頁面的「資料來源 → Apps Script 網頁應用程式」。
 *  之後修改本檔要「部署 → 管理部署作業 → 編輯 → 版本選新版本」，網址才會套用新程式。
 *
 * 名稱都加上 WEBAPP / webapp 前綴，避免和同一專案裡的成本計算腳本（CONFIG、round2_ 等）衝突。
 */
const WEBAPP_API_KEY = '請改成你自己的金鑰';   // 留空 '' 表示不檢查（不建議）
const WEBAPP_SHEET_ID = '';                    // 留空 = 使用這個 Apps Script 所屬的試算表
const WEBAPP_SHEETS = { tx: '股票', px: '現價查詢', cap: '本金' };
const WEBAPP_FX_CELL = 'I3';                   // 「本金」分頁裡即時匯率的儲存格

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (WEBAPP_API_KEY && p.key !== WEBAPP_API_KEY) return webappJson_({ ok: false, error: 'unauthorized' });
  try {
    const ss = WEBAPP_SHEET_ID ? SpreadsheetApp.openById(WEBAPP_SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const tz = ss.getSpreadsheetTimeZone();
    const date = v => (v instanceof Date) ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : String(v == null ? '' : v).trim();
    const num = v => (typeof v === 'number' && isFinite(v)) ? v : ((v === '' || v === null || isNaN(Number(v))) ? null : Number(v));
    const rows = (name, cols) => {
      const sh = ss.getSheetByName(name);
      if (!sh || sh.getLastRow() < 2) return [];
      return sh.getRange(2, 1, sh.getLastRow() - 1, cols).getValues();
    };

    const tx = rows(WEBAPP_SHEETS.tx, 5)
      .filter(r => r[0] !== '' && String(r[1]).trim() && String(r[2]).trim())
      .map(r => [date(r[0]), String(r[1]).trim(), String(r[2]).trim(), r[3] === '' ? '' : num(r[3]), r[4] === '' ? '' : num(r[4])]);

    const px = {};
    rows(WEBAPP_SHEETS.px, 4).forEach(r => {
      const code = String(r[0]).trim();
      if (code) px[code] = [num(r[1]), num(r[2]), num(r[3])];
    });

    const dep = rows(WEBAPP_SHEETS.cap, 4)
      .filter(r => r[0] !== '' && num(r[1]) > 0)
      .map(r => [date(r[0]), num(r[1]), num(r[2]), num(r[3]) || 0]);

    const capSheet = ss.getSheetByName(WEBAPP_SHEETS.cap);
    const fx = capSheet ? num(capSheet.getRange(WEBAPP_FX_CELL).getValue()) : null;

    return webappJson_({
      ok: true,
      data: { title: ss.getName(), asOf: Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm'), fx: fx, tx: tx, px: px, dep: dep }
    });
  } catch (err) {
    return webappJson_({ ok: false, error: String((err && err.message) || err) });
  }
}

function webappJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
