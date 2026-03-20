/**
 * Gemini API Service
 * 負責處理語言偵測與母語近似音譯音生成。
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export interface TranslitResult {
  original: string;
  transliteration: string;
  languageCode: string;
}

export async function fetchTransliteration(text: string, apiKey: string): Promise<TranslitResult> {
  // 增加更嚴格的 Prompt 確保回傳純 JSON
  const prompt = `你是一個專業的語音譯音專家。請偵測以下輸入文字的語言，並將其轉換為最接近發音的「中文譯音」（以漢字表示，這也被稱為母語近似音標註）。

規則：
1. 優先考慮發音的準確性而非文字意涵。
2. 對於英文、日文、韓文等，請提供最直覺、口語化的中文標註。
3. 輸出必須是一個純 JSON 物件，不包含 Markdown 代碼塊。

範例：
{"original": "Hello", "transliteration": "哈囉", "languageCode": "en-US"}

輸入：${text}
`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("401"); // 授權錯誤
    }
    throw new Error(`API 請求失敗: ${response.status}`);
  }

  const data = await response.json();
  try {
    const content = data.candidates[0].content.parts[0].text;
    return JSON.parse(content);
  } catch (error) {
    console.error("JSON 解析失敗:", error);
    throw new Error("解析 AI 回傳資料時發生錯誤");
  }
}
