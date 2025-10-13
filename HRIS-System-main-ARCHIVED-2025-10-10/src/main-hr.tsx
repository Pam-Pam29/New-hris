import React from 'react'
import ReactDOM from 'react-dom/client'
import HrApp from './App-hr'
import './index.css'
import { ThemeProvider } from './components/atoms/ThemeProvider'

console.log('🏢 MAIN-HR.TSX: Loading HR Platform!');
console.log('🏢 MAIN-HR.TSX: HrApp component:', HrApp);
console.log('🏢 MAIN-HR.TSX: Platform env:', process.env.PLATFORM);
console.log('🏢 MAIN-HR.TSX: Current URL:', window.location.href);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <HrApp />
        </ThemeProvider>
    </React.StrictMode>,
)
