import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// THREE.Clock is deprecated in three.js r152+ in favor of THREE.Timer.
// R3F 9.x still uses it internally; suppress until R3F updates.
const _warn = console.warn.bind(console)
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Clock') && args[0].includes('deprecated')) return
  _warn(...args)
}

createRoot(document.getElementById('root')!).render(<App />)
