import React from 'react'
import "./app.scss"
import Dock from './components/Dock'
import Nav from './components/Nav'
import MacWindow from './components/windows/MacWindow'
const App = () => {
  return (
    <div>
      <main>
        <Nav/>
        <Dock/>

        <MacWindow>
          <h1>hello</h1>
        </MacWindow>
      </main>
    </div>
  )
}

export default App
