/**
 * Web Speech API Service
 * 負責處理語音合成 (TTS)。
 */

export function speak(text: string, lang: string) {
  if (!window.speechSynthesis) {
    console.error("此瀏覽器不支持語音合成。");
    return;
  }

  // 取消當前所有朗讀
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  
  // 獲取所有語音
  const voices = window.speechSynthesis.getVoices();
  
  // 嘗試尋找對應語言的語音，優先選擇更自然的人聲（如果有的話）
  const targetVoice = voices.find(v => v.lang.startsWith(lang)) || voices.find(v => v.lang.includes(lang.split('-')[0]));
  
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  utterance.rate = 0.9; // 稍微慢一點，方便學習
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
}

/**
 * 預喚醒語音引擎
 * 某些行動裝置瀏覽器需要使用者互動才能初始化 TTS 引擎。
 */
export function preWarmTTS() {
  if (!window.speechSynthesis) return;
  const dummy = new SpeechSynthesisUtterance("");
  dummy.volume = 0;
  window.speechSynthesis.speak(dummy);
}
