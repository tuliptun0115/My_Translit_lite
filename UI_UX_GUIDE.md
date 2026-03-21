# 好好唸 - 介面與設計規範 (UI_UX_GUIDE)

> [!IMPORTANT]
> **語言規範**：本工具之使用者介面（UI）與技術文件全數採用**繁體中文**。

## 1. 視覺風格 (Visual Style)

### 1.1 色彩計畫 (Color Palette)
本應用以暖色調為主，旨在提供溫馨、無壓力的學習環境。

*   **基礎粉紅 (Pink)**:
    *   `Pink-50`: `#fdf2f8` (主背景底色)
    *   `Pink-200`: `#fbcfe8` (輕量裝飾/佔位符)
    *   `Pink-500`: `#ec4899` (主要按鈕/強調色)
    *   `Pink-600`: `#db2777` (長按/Hover 狀態)
*   **深層文本 (Text)**:
    *   `Gray-900`: `#111827` (原文與設定標題)
    *   `Pink-600`: `#db2777` (主要譯音標註)
*   **純白表面 (Surface)**:
    *   `White`: `#ffffff` (主要卡片容器背景)

### 1.2 字體規範 (Typography)
*   **主字體**: `Inter`, `system-ui`, `-apple-system`.
*   **排版細節**:
    *   首頁標題: `text-3xl font-bold` (30px).
    *   中文譯音展示: `text-4xl font-black text-pink-600` (36px).
    *   輸入區域: `text-lg` (18px).

## 2. 元件規範 (Components)

### 2.1 卡片容器 (Card)
*   **外觀**: 使用 `rounded-2xl` (16px) 的圓角，搭配 `shadow-xl` 的陰影提升浮空感。
*   **內容**: 包含輸入區、發送按鈕、以及結果區域。

### 2.2 互動按鈕 (Button)
*   **標準狀態**: `bg-pink-500 text-white rounded-2xl font-bold shadow-lg`.
*   **動畫效果**: 使用 `framer-motion` 實作 `active:scale-95` 的點擊縮放回饋。
*   **載入狀態**: 顯示旋轉中的 `RefreshCw` 圖標，並暫時禁用按鈕點擊。

### 2.3 響應式佈局 (Responsive Design)
*   **行動裝置 (Mobile)**: 單欄垂直佈局，適配 iPhone 15 等螢幕寬度。
*   **桌面裝置 (Desktop)**: 居中窄版容器 (`max-w-2xl`)，確保閱讀舒適性。

## 3. 圖標與 App 圖示

### 3.1 行動端 App 圖標 (App Icon)
在 iOS 或 Android 將網頁「加入主畫面」後，會顯示為：
*   **設計**: 粉紅漸層背景，中央為白色氣泡框語音標記。
*   **規格**: 專屬 `apple-touch-icon.png`。

### 3.2 功能圖標 (Lucide Icons)
採用 `Lucide-react` 系列圖標：
*   `Languages`: 專案標題圖標。
*   `Volume2`: 播放/重複聆聽按鈕。
*   `Sparkles`: 開始譯音按鈕圖標。
*   `RefreshCw`: 載入/修復狀態圖標。
*   `Settings`: API 設定面板入口。

## 4. 錯誤提示美學
錯誤訊息不應使用冷冰冰的報錯，而是採用：
*   **視覺**: 紅色淺背景 `bg-red-50` 搭配柔和紅邊框。
*   **語氣**: 溫暖且正面的回饋（如：「哎呀！API 額度滿了，請休息一下再試吧 💮」）。
