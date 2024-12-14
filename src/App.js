import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import FrontEndIndex from './frontend/Index';
import BackEndIndex from './backend/Index';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="" element={<FrontEndIndex />} />
        <Route exact path="admin" element={<BackEndIndex />} />
      </Routes>
    </Router>
  );
}

export default App;
