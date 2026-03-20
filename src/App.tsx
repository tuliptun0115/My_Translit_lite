import { useState, useEffect } from 'react'
import { Languages, Volume2, Sparkles, RefreshCw, Settings, X, Key } from 'lucide-react'
import { cn } from './utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchTransliteration, listModels, type TranslitResult } from './services/gemini'
import { speak, preWarmTTS } from './services/tts'

function App() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetail, setErrorDetail] = useState<string | null>(null)
  const [result, setResult] = useState<TranslitResult | null>(null)
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash-latest')
  const [isCheckingModels, setIsCheckingModels] = useState(false)
  
  // API Key 狀態管理
  const [apiKey, setApiKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [tempKey, setTempKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key')
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-1.5-flash-latest'
    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    const initialKey = savedKey || envKey || ''
    setApiKey(initialKey)
    setTempKey(initialKey)
    setSelectedModel(savedModel)
    
    // 如果沒有 Key，主動提示設定 (延遲一下確保 UI 已載入)
    if (!initialKey) {
      setTimeout(() => setShowSettings(true), 500)
    }
  }, [])

  const handleSaveKey = () => {
    const trimmedKey = tempKey.trim().replace(/[\s\u200B-\u200D\uFEFF]/g, "")
    if (!trimmedKey) {
      setError("金鑰不能為空")
      return
    }
    localStorage.setItem('gemini_api_key', trimmedKey)
    localStorage.setItem('gemini_model', selectedModel)
    setApiKey(trimmedKey)
    setShowSettings(false)
    setError(null)
    setErrorDetail(null)
  }

  const handleTransliterate = async () => {
    if (!input.trim()) return
    if (!apiKey) {
      setShowSettings(true)
      return
    }
    
    preWarmTTS()
    setIsLoading(true)
    setError(null)
    setErrorDetail(null)
    
    try {
      const res = await fetchTransliteration(input, apiKey, selectedModel)
      setResult(res)
      speak(res.original, res.languageCode)
    } catch (err: any) {
      console.error('API Error:', err)
      const errStr = err.toString()
      const keyPrefix = apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "無金鑰"
      setErrorDetail(`[金鑰末四碼: ${apiKey.slice(-4)}] ${errStr}`)

      if (errStr.includes('401') || errStr.toLowerCase().includes('key not valid') || errStr.includes('403')) {
        setError('API Key 無效或權限不足，請檢查設定。')
      } else if (errStr.includes('404')) {
        setError('找不到 AI 模型，可能是型號名稱不正確，請回報給技術夥伴。')
      } else if (errStr.includes('TypeError') || errStr.includes('Failed to fetch')) {
        setError('連線被阻擋或網路不穩定，請確認手機是否可連至 Google。')
      } else {
        setError('哎呀！連線出了一點小問題，請點擊下方詳情查看。🌸')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckModels = async () => {
    if (!tempKey.trim()) return
    setIsCheckingModels(true)
    setError(null)
    try {
      const models = await listModels(tempKey.trim())
      setAvailableModels(models)
      // 自動選取第一個可用的模型
      if (models.length > 0) {
        const firstModel = models[0].name.split('/').pop()
        setSelectedModel(firstModel)
      }
    } catch (err: any) {
      setError(`取得模型列表失敗: ${err.message}`)
    } finally {
      setIsCheckingModels(false)
    }
  }

  const handleReplay = () => {
    if (result) {
      speak(result.original, result.languageCode)
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-x-hidden">
      {/* 設定按鈕 - 行動端更安全的位置 */}
      <div className="fixed top-4 right-4 z-40">
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-pink-400 hover:text-pink-600 transition-all hover:rotate-90 active:scale-90"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <header className="mb-8 sm:mb-12 text-center pt-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl mb-4"
        >
          <Languages className="w-8 h-8 text-pink-500" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight px-4">My Translit Lite</h1>
        <p className="text-pink-600 font-medium">母語近似音標註工具</p>
      </header>

      <main className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        <section className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              輸入原文 (各國語言)
            </label>
            {apiKey && (
              <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                API 已就緒
              </span>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此輸入想要學習發音的單字或句子..."
            className="w-full h-32 p-4 text-lg border-2 border-pink-50 rounded-2xl focus:border-pink-500 focus:outline-none transition-all resize-none placeholder-pink-200 text-gray-800 bg-gray-50/30"
          />
        </section>

        <button
          onClick={handleTransliterate}
          disabled={isLoading || !input.trim()}
          className={cn(
            "w-full py-4 bg-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-pink-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
            !isLoading && "hover:bg-pink-600 hover:shadow-pink-200"
          )}
        >
          {isLoading ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>進行譯音與朗讀</span>
            </>
          )}
        </button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 space-y-2"
            >
              <div className="font-bold flex items-center gap-2">
                <X className="w-5 h-5" />
                {error}
              </div>
              {errorDetail && (
                <details className="text-[10px] opacity-70 cursor-pointer">
                  <summary className="hover:underline">查看技術錯誤詳情</summary>
                  <div className="mt-2 p-2 bg-red-100/50 rounded-lg font-mono break-all">
                    {errorDetail}
                  </div>
                </details>
              )}
              <button 
                onClick={() => setShowSettings(true)}
                className="text-xs font-bold underline hover:text-red-800"
              >
                檢查 API Key 設定 →
              </button>
            </motion.div>
          )}

          {result && !error && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 border-t border-pink-50"
            >
              <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-3xl p-6 space-y-4">
                <div>
                  <span className="text-[10px] font-black text-pink-300 uppercase tracking-[0.2em]">
                    中文譯音標註 (近似音)
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-pink-600 mt-2 flex items-center gap-3">
                    {result.transliteration}
                    <button 
                      onClick={handleReplay}
                      className="p-3 bg-white rounded-full shadow-md text-pink-400 hover:text-pink-600 transition-all active:scale-90"
                      title="重讀一次"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-medium bg-white/50 inline-block px-3 py-1 rounded-full border border-pink-50">
                  原文：<span className="text-gray-600">{result.original}</span> 
                  <span className="mx-2 text-pink-200">|</span> 
                  語系：<span className="text-pink-400">{result.languageCode}</span>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* 設定 Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-pink-500" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink-50 rounded-2xl">
                    <Key className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">API 設定</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Local Storage Only</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-black text-gray-700">Gemini API Key</label>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[11px] text-pink-500 font-bold hover:underline">申請免費用戶金鑰 →</a>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      placeholder="輸入 AIzaSy... 開頭的金鑰"
                      className="w-full p-4 pr-12 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:border-pink-500 focus:bg-white focus:outline-none transition-all placeholder-gray-300 text-gray-800"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 px-2 py-1 rounded-md text-[10px] font-black text-pink-500 border border-pink-200 shadow-sm active:bg-pink-50"
                    >
                      {showPassword ? "隱藏" : "顯示"}
                    </button>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[9px] text-gray-400 font-bold">目前版本：v0.1.13 (Key-Transparency)</p>
                    <button 
                      onClick={handleCheckModels}
                      disabled={isCheckingModels}
                      className="text-[9px] text-pink-500 font-bold underline hover:text-pink-700 disabled:opacity-50"
                    >
                      {isCheckingModels ? "偵測中..." : "重新偵測可用模型"}
                    </button>
                  </div>

                  {tempKey && (
                    <p className="text-[8px] text-gray-400 px-1">
                      首四碼: <span className="text-pink-400 font-mono">{tempKey.trim().slice(0, 4)}</span>... 
                      末四碼: <span className="text-pink-400 font-mono">{tempKey.trim().slice(-4)}</span>
                    </p>
                  )}
                  
                  {availableModels.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 max-h-32 overflow-y-auto space-y-1">
                      <p className="text-[9px] font-bold text-gray-500 mb-1">✅ 偵測成功！請點選下方模型進行切換：</p>
                      {availableModels.slice(0, 15).map((m, i) => {
                        const mName = m.name.split('/').pop();
                        const isSelected = selectedModel === mName;
                        return (
                          <button 
                            key={i} 
                            onClick={() => setSelectedModel(mName)}
                            className={cn(
                              "w-full text-[8px] font-mono break-all p-2 rounded flex justify-between items-center transition-all",
                              isSelected ? "bg-pink-500 text-white shadow-md scale-[1.02]" : "bg-white text-gray-400 border border-gray-100 hover:border-pink-200"
                            )}
                          >
                            <span>{mName}</span>
                            <span>{isSelected ? "已選取" : "點擊選取"}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isCheckingModels === false && availableModels.length === 0 && !error && (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                      <p className="text-[10px] text-red-500 font-bold">⚠️ 偵測失敗：此金鑰未開啟任何 AI 模型權限。</p>
                      <p className="text-[9px] text-red-400 mt-1">請確認是否在 AI Studio 點擊了 "Create API key in NEW project"。</p>
                    </div>
                  )}
                  <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 space-y-2">
                    <p className="text-[10px] text-pink-600 leading-relaxed font-medium">
                      🔒 <b>隱私保護：</b> 金鑰僅會存放在您手機中，不會傳送到 GitHub 或任何伺服器。
                    </p>
                    <p className="text-[9px] text-pink-400 leading-relaxed">
                      📱 <b>手機版不能用？</b> 請點擊下方「強制環境修復」以清除過期快取並重新載入。
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.href = window.location.pathname + '?t=' + Date.now();
                      }}
                      className="flex-1 py-3 bg-red-50 text-red-500 rounded-2xl font-bold text-xs hover:bg-red-100 transition-all active:scale-95 border border-red-100"
                    >
                      強制環境修復
                    </button>
                    <button 
                      onClick={() => {
                          localStorage.removeItem('gemini_api_key');
                          setTempKey('');
                          setApiKey('');
                      }}
                      className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-all active:scale-95"
                    >
                      僅清除金鑰
                    </button>
                  </div>
                  <button 
                    onClick={handleSaveKey}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl active:scale-95 shadow-gray-200"
                  >
                    儲存變更並關閉
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-12 mb-8 text-pink-300 text-[10px] font-bold uppercase tracking-[0.2em] flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
           <span>Created by Antigravity Partner</span>
           <span className="animate-pulse text-pink-400">🌸</span>
        </div>
        <div className="opacity-50">Version: 0.1.13 (Key-Transparency)</div>
      </footer>
    </div>
  )
}

export default App
