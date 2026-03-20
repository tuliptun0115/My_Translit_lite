import { useState } from 'react'
import { Languages, Volume2, Sparkles, RefreshCw } from 'lucide-react'
import { cn } from './utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchTransliteration, type TranslitResult } from './services/gemini'
import { speak, preWarmTTS } from './services/tts'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TranslitResult | null>(null)

  const handleTransliterate = async () => {
    if (!input.trim()) return
    
    // 預喚醒 TTS
    preWarmTTS()
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        throw new Error('MISSING_KEY')
      }

      const res = await fetchTransliteration(input, API_KEY)
      setResult(res)
      
      // 自動朗讀
      speak(res.original, res.languageCode)
    } catch (err: any) {
      console.error(err)
      if (err.message === '401') {
        setError('授權已過期或無效，請檢查 API Key 並重新整理頁面。')
      } else if (err.message === 'MISSING_KEY') {
        setError('尚未設定 API Key，請在 .env.local 中設定 VITE_GEMINI_API_KEY。')
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
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
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

      <footer className="mt-12 text-pink-300 text-sm">
        由 Antigravity 技術夥伴為您打造 🌸
      </footer>
    </div>
  )
}

export default App
