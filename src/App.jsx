import React from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Header from './components/Header/Header'
import EndpointTable from './components/EndpointTable/EndpointTable'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <EndpointTable />
      </div>
    </div>
  )
}

export default App