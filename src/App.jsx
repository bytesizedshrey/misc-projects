import React from "react";
import "./app.scss";
import Dock from "./components/Dock";
import Nav from "./components/Nav";
import MacWindow from "./components/windows/MacWindow";
import Github from "./components/windows/Github";
import Note from "./components/windows/Note";
import Resume from "./components/windows/Resume";
import Spotify from "./Spotify";
import Cli from "./components/windows/Cli";
const App = () => {
  return (
    <div>
      <main>
        <Nav />
        <Dock />
        <Github />
        <Note />
        <Resume />
        <Spotify />
        <Cli/>
      </main>
    </div>
  );
};

export default App;
