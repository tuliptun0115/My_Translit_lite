# 好好唸 (My Translit Lite) - 智慧語言發音輔助工具

一個基於 Google Gemini AI 的輕量化網頁應用，專門為想要快速學習外語發音、但看不懂國際音標的朋友設計。

## 🌟 核心特色

*   **零門檻發音**：將任何語言（日文、英文、韓文等）轉換為最接近的「中文譯音」。
*   **高品質人聲**：自動挑選您設備中最自然、最具情感的優質語音進行朗讀。
*   **隱私至上**：免註冊，所有 API 金鑰僅儲存在您的瀏覽器中。
*   **流暢且生動**：採用 Framer Motion 打造絲滑的動畫體驗。

## 🚀 快速開始

### 在線直接體驗 (GitHub Pages)
👉 **[點此開始使用](https://tuliptun0115.github.io/My_Translit_lite/)**

### 本地開發環境
1.  安裝依賴：`npm install`
2.  啟動開發伺服器：`npm run dev`
3.  打包發佈：`npm run deploy`

## 📁 專案資產說明
本專案嚴格遵循「資產五件套」規範，所有文件均為繁體中文：
*   **[PRD.md](PRD.md)** - 產品需求與核心功能說明。
*   **[TECH_DOC.md](TECH_DOC.md)** - 技術架構與 API 規格。
*   **[UI_UX_GUIDE.md](UI_UX_GUIDE.md)** - 設計視覺規範。
*   **[CHANGELOG.md](CHANGELOG.md)** - 版本演進日誌。
*   **[.cursorrules](.cursorrules)** - 機器人開發指導規範。

## 🛠️ 技術棧
*   **框架**: React 19 + Vite 6
*   **語言**: TypeScript
*   **樣式**: Tailwind CSS (v4)
*   **AI**: Google Gemini API (1.5 Flash / 2.0 Flash)

## 💰 使用服務與費用說明

本專案採用「無後端架構」，所有 AI 運算皆透過使用者提供的 API 金鑰直接與服務商連線：

*   **調用模型**：
    *   **Web Speech API (TTS)**：瀏覽器原生語音引擎（負責語音合成播放），**完全免費且無額度限制**。
    *   **Gemini 1.5/2.0 Flash**：由 Google AI 提供，負責語言偵測與譯音生成。
*   **API KEY 來源**：
    *   **Google AI Studio**，預設建議使用**免費版 (Free Tier)**。
*   **預估每日使用限制 (免費額度)**：
    *   **每日請求 (RPD)**：1,500 次。
    *   **每分鐘請求 (RPM)**：15 次 (1.5 Flash) / 10 次 (2.0 Flash)。
*   **隱私說明**：所有 API 金鑰僅儲存於您的瀏覽器 Local Storage，安全性高且不會上傳至開發者伺服器。

---
*Created with ❤️ by Antigravity Technical Partner.*
