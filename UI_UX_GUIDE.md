# My_Translit_lite - UI_UX_GUIDE (介面與設計規範)

> [!IMPORTANT]
> **語言規範**：本工具之使用者介面（UI）全數採用**繁體中文**。

## 1. 視覺風格 (Visual Style)

### 1.1 色彩計畫 (Color Palette)
*   **Primary (Pink)**:
    *   `Pink-50`: `#fdf2f8` (背景底色)
    *   `Pink-200`: `#fbcfe8` (邊框/輕量裝飾)
    *   `Pink-500`: `#ec4899` (主按鈕/強調色)
    *   `Pink-600`: `#db2777` (Hover 狀態)
*   **Text**:
    *   `Gray-900`: `#111827` (原文)
    *   `Pink-700`: `#be185d` (譯音強調)
*   **Surface**:
    *   `White`: `#ffffff` (卡片背景)

### 1.2 字體 (Typography)
*   **Primary**: `Inter`, `system-ui`, `-apple-system`.
*   **Sizing**:
    *   Title: `text-3xl font-bold tracking-tight`.
    *   Transliteration: `text-4xl font-black text-pink-600`.
    *   Input: `text-lg`.

## 2. 元件規範 (Components)

### 2.1 卡片 (Card)
*   圓角：`rounded-2xl` (16px)。
*   陰影：`shadow-xl`。
*   內距：`p-6` 或 `p-8`。

### 2.2 按鈕 (Button)
*   風格：`bg-pink-500 text-white rounded-full px-8 py-4`.
*   互動：`hover:bg-pink-600 transition-all active:scale-95`.
*   載入狀態：顯示 Spinner 並禁用按鈕。

### 2.3 輸入框 (Input/Textarea)
*   風格：`border-2 border-pink-100 focus:border-pink-500 rounded-xl`.
*   佔位符：`text-pink-300`.

## 3. 互動邏輯 (Interactions)

### 3.1 朗讀動畫
*   點擊朗讀時，結果區域使用 `AnimatePresence` (framer-motion) 進行 `fade-in-up` 效果。
*   朗讀中，音量圖標可進行微幅縮放動畫。

### 3.2 響應式佈局 (RWD)
*   Mobile: 單欄垂直排列。
*   Tablet/Desktop: 居中窄版容器 (`max-w-2xl mx-auto`)。

## 4. 圖標規格 (Icons)
採用 `Lucide-react`:
*   `Languages`: 標題圖標。
*   `Volume2`: 播放按鈕。
*   `Sparkles`: AI 處理指示。
*   `RefreshCw`: 載入/錯誤重試。
