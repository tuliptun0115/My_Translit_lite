# 好好唸 - 技術開發文件 (TECH_DOC)

## 1. 系統架構

### 1.1 前端專案結構
本專案採用 Vite + React (TypeScript) 進行開發，完全無須後端伺服器，所有邏輯皆在使用者瀏覽器執行。

```text
src/
├── services/           # API 服務 (Gemini API, TTS 語音服務)
├── utils/              # 工具函數 (cn 類別整合輔助)
└── App.tsx             # 主要應用程式邏輯、狀態與佈局
```

## 2. API 規格與連線

### 2.1 Gemini 1.5/2.0 AI 模型
*   **用途**：負責自動語言偵測與生成精準的「母語近似音」中文譯音。
*   **連線端點**：
    *   Gemini 1.5 系列：`v1/models/{modelId}:generateContent` (穩定版)
    *   Gemini 2.0 系列：`v1beta/models/{modelId}:generateContent` (實驗版)
*   **安全性與隱私**：
    *   **本地存儲**：所有 API 金鑰僅儲存於瀏覽器的 Local Storage，不會傳送到伺服器。
    *   **透明化**：發生錯誤時，頁面會顯示金鑰末四碼供使用者確認。
*   **智能自癒機制 (Self-Healing)**：
    *   系統會自動掃描可用的 Gemini 模型清單。
    *   自動對多個模型發送微小的 Probe 測試請求，以避開配額耗盡 (429) 的模型。

### 2.2 Web Speech API (語音播放)
*   **用途**：調用裝置本地的語音合成引擎進行朗讀。
*   **高品質語音優化 (Premium Voice Selection)**：
    *   自動過濾並優先挑選名稱中包含 "Natural"、"Premium"、"Siri" 或 "Enhanced" 的優質人聲。
    *   自動調整語速與語調（預設音率約 0.85x - 0.9x）以提升學習效果。

## 3. 資料交換格式

### 3.1 譯音結果物件
```typescript
interface TranslitResult {
  original: string;         // 原文
  transliteration: string;  // 中文譯音標註
  languageCode: string;     // ISO 語言代碼 (如: 'ja-JP')
}
```

## 4. 錯誤處理與 iPhone 相容性

### 4.1 指數退避重試 (Exponential Backoff)
針對網路不穩定或 API 暫時性繁忙，系統會依序以 1秒、2秒、4秒的間隔進行自動重試。

### 4.2 iPhone (Safari) 專用優化策略
*   **API 韌性**：預設添加 `Accept: application/json` 標頭，解決 Safari 部分版本解析 JSON 的異常。
*   **精準錯誤映射**：將錯誤區分為「額度用盡 (429)」、「授權失敗 (401/403)」與「網路阻擋 (Failed to fetch)」，並針對 iPhone 給予具體的連線指引。
*   **主畫面圖標 (App Icon)**：配置 `apple-touch-icon`，使用者可將本網頁「加入主畫面」作為原生 App 使用。

## 5. 費用與配額預測 (API Cost)

*   **免費層級 (Free Tier)**：每日 1,500 次請求。這是本專案的預設使用方式。
*   **付費層級**：若流量極大，可手動切換為 Pay-as-you-go 模式。
