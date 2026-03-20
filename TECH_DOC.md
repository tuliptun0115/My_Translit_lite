# My_Translit_lite - TECH_DOC (技術開發文件)

## 1. 系統架構

### 1.1 前端專案結構
採用 Vite + React (TypeScript) 建構。

```text
src/
├── services/           # API 服務 (Gemini API, TTS Service)
├── utils/              # 工具函數 (cn helper)
└── App.tsx             # 主要邏輯與佈局控制
```

## 2. API 規格

### 2.1 Gemini 2.5 Flash API
*   **用途**：偵測語言並生成譯音。
*   **端點**：`v1beta/models/gemini-2.5-flash:generateContent`
*   **Prompt 策略**：採用嚴格 JSON 守護機制，確保輸出純淨的譯音、原文與語言代碼。
*   **模型參數**：預設穩定輸出。

### 2.2 Web Speech API
*   **用途**：播放音訊。
*   **流程**：
    1.  初始化 `SpeechSynthesisUtterance`。
    2.  根據 `languageCode` 過濾 `window.speechSynthesis.getVoices()`。
    3.  預喚醒語音引擎（在使用者點擊按鈕時立即調用空的 `speak`）。

## 3. 資料結構

### 3.1 翻譯結果物件
```typescript
interface TranslitResult {
  original: string;
  transliteration: string;
  languageCode: string; // 例如: 'en-US', 'ja-JP', 'ko-KR'
}
```

## 4. 錯誤處理與穩定性

### 4.1 指數退避 (Exponential Backoff)
針對 API 請求失敗，實作 1s, 2s, 4s 的重試機制。

### 4.2 JSON 解析守護
API 回傳內容可能包含 ```json ... ``` 標記，封裝解析函數：
```javascript
const safeParseJSON = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
};
```

## 6. 費用預估 (API Cost Estimation)

基於 **Gemini 1.5/2.0/2.5 Flash** 系列模型的計費標準，以下為預估費用（假設單次請求平均 200 input tokens / 100 output tokens）：

### 6.1 免費層級 (Free Tier)
*   **額度**：15 RPM (每分鐘請求數) / 1,500 RPD (每日請求數)。
*   **費用**：$0 (適合開發與小規模個人使用)。

### 6.2 付費層級 (Pay-as-you-go) - 以 1,000 次使用為單位
| 模型類型 | 1,000 次請求預估費用 (USD) | 備註 |
| :--- | :--- | :--- |
| **Gemini 1.5 Flash** | ~$0.045 | 極度廉價，適合初期上線。 |
| **Gemini 2.5 Flash** | ~$0.31 | 效能平衡版。 |
| **Gemini 2.5 Flash-Lite** | ~$0.06 | 高性價比選擇。 |

### 6.3 重要說明 (Crucial Note)
*   **非自動切換**：免費層級與付費層級是分開的。在 Google AI Studio 中，若使用「免費 API Key」，當達到 15 RPM 或 1,500 RPD 限制時，API 會回傳 **429 錯誤**（請求過多），而**不會自動轉為扣費**。
*   **建議**：初期開發與個人使用請選擇「免費層級」即可。若未來流量成長，需手動建立具備「付費權限」的 API Key，屆時才會開始產生費用。
