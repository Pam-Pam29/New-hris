import React from 'react'
import ReactDOM from 'react-dom/client'
import EmployeeApp from './App-employee'
import './index.css'
import { ThemeProvider } from './components/atoms/ThemeProvider'

console.log('👤 MAIN-EMPLOYEE.TSX: Loading Employee Platform!');
console.log('👤 MAIN-EMPLOYEE.TSX: EmployeeApp component:', EmployeeApp);
console.log('👤 MAIN-EMPLOYEE.TSX: Platform env:', process.env.PLATFORM);
console.log('👤 MAIN-EMPLOYEE.TSX: Current URL:', window.location.href);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <EmployeeApp />
        </ThemeProvider>
    </React.StrictMode>,
)

