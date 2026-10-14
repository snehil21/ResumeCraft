import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./components/Landing/Landing";
import Body from "./components/Body/Body";
import Start from "./components/Start/Start";
import FeedbackWidget from "./components/FeedbackWidget/FeedbackWidget";

import "./App.css";

const ImportResume = React.lazy(
  () => import("./components/ImportResume/ImportResume")
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/start" element={<Start />} />
        <Route
          path="/import"
          element={
            <Suspense fallback={<main aria-busy="true">Loading local import...</main>}>
              <ImportResume />
            </Suspense>
          }
        />
        <Route path="/resumebuilder" element={<Body />} />
      </Routes>
      <FeedbackWidget />
    </Router>
  );
}

export default App;
