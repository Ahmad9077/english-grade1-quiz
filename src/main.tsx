import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/lalezar/arabic-400.css'
import '@fontsource/lalezar/latin-400.css'
import '@fontsource-variable/baloo-bhaijaan-2'
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import './styles/app.css'
import App from './App'
import { HUB_URL, bootstrapQuiz } from './hub/bootstrap'
import { HubBridge } from './hub/bridge'

const root = document.getElementById('root')
if (!root) throw new Error('Quiz root element is missing.')
const mountRoot = root

document.documentElement.lang = 'ar'
document.documentElement.dir = 'rtl'
document.documentElement.dataset.buildMode = __QUIZ_BUILD_MODE__
if (__QUIZ_BUILD_MODE__ === 'preview') document.title = 'English · نسخة تجريبية'

async function mount(): Promise<void> {
  try {
    const context = await bootstrapQuiz(__QUIZ_BUILD_MODE__)
    createRoot(mountRoot).render(
      <StrictMode>
        <App context={context} bridge={new HubBridge(context.mode)} />
      </StrictMode>,
    )
  } catch {
    const main = document.createElement('main')
    main.className = 'screen bootstrap-error'
    const title = document.createElement('h1')
    title.textContent = 'تعذر فتح «English»'
    const text = document.createElement('p')
    text.textContent = 'الرجوع إلى صفحة الاختبارات وفتح «English» مرة أخرى يحل المشكلة غالبا.'
    const link = document.createElement('a')
    link.className = 'big-button big-button-leaf'
    link.href = HUB_URL
    link.textContent = 'العودة إلى الاختبارات'
    main.append(title, text, link)
    mountRoot.replaceChildren(main)
  }
}

void mount()
