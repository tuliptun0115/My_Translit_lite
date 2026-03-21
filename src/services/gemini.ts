/**
 * Gemini API Service
 * 負責處理語言偵測與母語近似音譯音生成。
 */


export interface TranslitResult {
  original: string;
  transliteration: string;
  languageCode: string;
}

export async function fetchTransliteration(text: string, apiKey: string, modelId: string = "gemini-1.5-flash"): Promise<TranslitResult> {
  const cleanKey = apiKey.trim().replace(/[\s\u200B-\u200D\uFEFF]/g, "");
  // 使用 v1 穩定版端點 (1.5 系列最佳實踐)
  const apiVersion = modelId.includes('2.0') ? 'v1beta' : 'v1';
  const dynamicUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelId}:generateContent`;
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

  const response = await fetch(`${dynamicUrl}?key=${encodeURIComponent(cleanKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
  });

  if (!response.ok) {
    let errorMsg = response.statusText;
    let errorCode = response.status;
    try {
      const data = await response.json();
      errorMsg = data.error?.message || errorMsg;
      errorCode = data.error?.status || errorCode;
    } catch (e) {
      // 如果不是 JSON，維持 statusText
    }
    throw new Error(`API請求失敗: ${errorCode} - ${errorMsg}`);
  }

  const data = await response.json();
  
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("API 回傳格式錯誤或無內容");
  }

  try {
    // 移除可能存在的 Markdown 程式碼區塊標記
    const cleanJson = content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("JSON Parsing Error:", content);
    throw new Error("無法解析 AI 回傳的 JSON 格式");
  }
}
export async function testModel(apiKey: string, modelId: string): Promise<boolean> {
  const cleanKey = apiKey.trim().replace(/[\s\u200B-\u200D\uFEFF]/g, "");
  const apiVersion = modelId.includes('2.0') ? 'v1beta' : 'v1';
  const dynamicUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelId}:generateContent`;
  try {
    const response = await fetch(`${dynamicUrl}?key=${encodeURIComponent(cleanKey)}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] }),
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}
export async function listModels(apiKey: string) {
  const cleanKey = apiKey.trim().replace(/[\s\u200B-\u200D\uFEFF]/g, "");
  // 使用 v1 穩定版獲取模型列表
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(cleanKey)}`, {
    headers: { "Accept": "application/json" }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "無法取得模型列表");
  }
  return data.models || [];
}
