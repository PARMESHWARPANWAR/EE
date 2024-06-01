import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Components
import Navigation from './components/Navigation';

// Config
import MyProperties from './components/MyProperties';
import MarketPlace from './components/MarketPlace';
import { useRealEstateMarketplace } from './context/realStateContext';
import Loader from './components/Loader';

function App() {
  const {featching } = useRealEstateMarketplace();
  return (
    <Router>
      <div className='min-h-screen bg-gray-100'>
        <Navigation />
        {featching ? <Loader/> :
          <div className="">
            <Routes>
              <Route path="/" element={<MarketPlace />} />
              <Route path="/user/properties" element={<MyProperties />} />
              <Route path="*" element={<MarketPlace />} />
            </Routes>
          </div>
        }

      </div>
    </Router>
  );
}

export default App;