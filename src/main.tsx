import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './i18n'
import App from './App'
import { queryClient } from './lib/query-client'
import { applyStoredDocumentAppearance } from './lib/theme'

applyStoredDocumentAppearance()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
