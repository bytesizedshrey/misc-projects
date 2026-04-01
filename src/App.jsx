import React from 'react'
import "./app.scss"
import Dock from './components/Dock'
import Nav from './components/Nav'
const App = () => {
  return (
    <div>
      <main>
        <Nav/>
        <Dock/>
      </main>
    </div>
  )
}

export default App
