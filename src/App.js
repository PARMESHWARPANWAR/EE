import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster, toast } from 'sonner'
// Components
import Navigation from './components/Navigation';

// Config
import MyProperties from './components/MyProperties';
import MarketPlace from './components/MarketPlace';
import { useRealEstateMarketplace } from './context/realStateContext';
import Loader from './components/Loader';
import MintProperty from './components/MintProperty';

function App() {
  const {featching } = useRealEstateMarketplace();
  return (
    <Router>
      <div className='min-h-screen bg-gray-100'>
        <Toaster position="bottom-right" />
        <Navigation />
        {featching ? <Loader/> :
          <div className="">
            <Routes>
              <Route path="/" element={<MarketPlace />} />
              <Route path="/user/properties" element={<MyProperties />} />
              <Route path="/user/on-chain" element={<MintProperty />} />
              <Route path="*" element={<MarketPlace />} />
            </Routes>
          </div>
        }

      </div>
    </Router>
  );
}

export default App;