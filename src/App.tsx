import { useState, useEffect } from 'react'
import { Languages, Volume2, Sparkles, RefreshCw, Settings, X, Key } from 'lucide-react'
import { cn } from './utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchTransliteration, type TranslitResult } from './services/gemini'
import { speak, preWarmTTS } from './services/tts'

function App() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TranslitResult | null>(null)
  
  // API Key 狀態管理
  const [apiKey, setApiKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [tempKey, setTempKey] = useState('')

  // 初始化讀取 LocalStorage 或 Env
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key')
    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    const initialKey = savedKey || envKey || ''
    setApiKey(initialKey)
    setTempKey(initialKey)
    
    // 如果沒有 Key，主動提示設定
    if (!initialKey) {
      setShowSettings(true)
    }
  }, [])

  const handleSaveKey = () => {
    localStorage.setItem('gemini_api_key', tempKey)
    setApiKey(tempKey)
    setShowSettings(false)
    setError(null)
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
    
    try {
      const res = await fetchTransliteration(input, apiKey)
      setResult(res)
      speak(res.original, res.languageCode)
    } catch (err: any) {
      console.error(err)
      if (err.message.includes('401') || err.message.includes('key not valid')) {
        setError('API Key 無效或授權錯誤，請點擊右上角設定確認。')
      } else {
        setError('哎呀！連線出了一點小問題，請稍後再試一次吧 🌸')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReplay = () => {
    if (result) {
      speak(result.original, result.languageCode)
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative">
      {/* 設定按鈕 */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-lg text-pink-400 hover:text-pink-600 transition-all hover:rotate-90"
      >
        <Settings className="w-6 h-6" />
      </button>

      <header className="mb-12 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl mb-4"
        >
          <Languages className="w-8 h-8 text-pink-500" />
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">My Translit Lite</h1>
        <p className="text-pink-600 font-medium">母語近似音標註工具</p>
      </header>

      <main className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        <section className="space-y-2">
          <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
            輸入原文 (各國語言)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此輸入想要學習發音的單字或句子..."
            className="w-full h-32 p-4 text-lg border-2 border-pink-100 rounded-xl focus:border-pink-500 focus:outline-none transition-colors resize-none placeholder-pink-200 text-gray-800"
          />
        </section>

        <button
          onClick={handleTransliterate}
          disabled={isLoading || !input.trim()}
          className={cn(
            "w-full py-4 bg-pink-500 text-white rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100"
            >
              {error}
            </motion.div>
          )}

          {result && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pt-6 border-t border-pink-50 overflow-hidden"
            >
              <div className="bg-pink-50/50 rounded-2xl p-6 space-y-4">
                <div>
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">
                    中文譯音標註 (近似音)
                  </span>
                  <div className="text-4xl font-black text-pink-600 mt-1 flex items-baseline gap-2">
                    {result.transliteration}
                    <button 
                      onClick={handleReplay}
                      className="p-2 text-pink-300 hover:text-pink-500 transition-colors active:scale-90"
                      title="重讀一次"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  原文：<span className="italic">{result.original}</span> ({result.languageCode})
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* 設定 Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-pink-500" />
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-pink-50 rounded-2xl">
                  <Key className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">API 設定</h2>
                  <p className="text-sm text-gray-500">此金鑰僅存於您的瀏覽器中 🔒</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Gemini API Key</label>
                  <input 
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="輸入 AIza... 開頭的金鑰"
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-pink-500 focus:outline-none transition-all"
                  />
                  <p className="text-xs text-gray-400 px-1">
                    還沒有金鑰？去 <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-pink-500 hover:underline">Google AI Studio</a> 免費申請一個吧。
                  </p>
                </div>

                <button 
                  onClick={handleSaveKey}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                >
                  確認並儲存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-12 text-pink-300 text-sm">
        由 Antigravity 技術夥伴為您打造 🌸
      </footer>
    </div>
  )
}

export default App
