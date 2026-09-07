import ReactDOM from 'react-dom/client'
import './i18n'
import QuickPaneApp from './components/quick-pane/QuickPaneApp'
import { applyStoredDocumentAppearance } from './lib/theme'
import './quick-pane.css'

applyStoredDocumentAppearance()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QuickPaneApp />
)
