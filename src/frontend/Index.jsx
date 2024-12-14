import {Routes, Route} from 'react-router-dom';
import Home from './pages/home/Home';
import './index.css';

function FrontEndIndex() {
  return (
    <div className="container">
        <Routes>
        <Route exact path="" element={<Home />} />
        </Routes>
    </div>
  );
}

export default FrontEndIndex;
