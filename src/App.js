import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FixtureResults from './scores/Scores';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/results" element={<FixtureResults/>}/>
          
        </Routes>
      </div>
    </Router>
  );
};

export default App;
