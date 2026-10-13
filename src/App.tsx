import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./components/Landing/Landing";
import Body from "./components/Body/Body";
import Start from "./components/Start/Start";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/start" element={<Start />} />
        <Route path="/resumebuilder" element={<Body />} />
      </Routes>
    </Router>
  );
}

export default App;
