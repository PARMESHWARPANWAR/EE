import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Components
import Navigation from './components/Navigation';

// Config
import MyProperties from './components/MyProperties';
// import MarketPlace from './components/MarketPlace';
import { useRealEstateMarketplace } from './context/realStateContext';
// import MyProperties from './components/Test/MyProperties';
import MarketPlace from './components/MarketPlace';

function App() {
  const { provider, escrow, account, publicProperties } = useRealEstateMarketplace();
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false);

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <Router>
      <div>
        <Navigation />
        <div className="min-h-screen bg-gray-100">
          <Routes>
          <Route path="/" element={<MarketPlace />} />
            <Route path="/user/properties" element={<MyProperties />} />
            <Route path="/user/publish-property" element={<PublishProperty />} />
            <Route path="/user/approval-requests" element={<ApprovalRequests />} />
            <Route path="/user/waiting-approval" element={<WaitingApproval />} />
            <Route path="*" element={<MarketPlace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;


// MyProperties.js

// function MyProperties() {
//   return (
//     <div className="container mx-auto py-8">
//       <h2 className="text-3xl font-bold mb-4">My Properties</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {/* Display user's properties */}
//       </div>
//     </div>
//   );
// }

// PublishProperty.js

function PublishProperty() {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-4">Publish Property</h2>
      <div className="max-w-md mx-auto">
        {/* Render form to publish a new property */}
      </div>
    </div>
  );
}

// ApprovalRequests.js

function ApprovalRequests() {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-4">Approval Requests</h2>
      <div className="bg-white shadow rounded-lg p-6">
        {/* Display approval requests */}
      </div>
    </div>
  );
}


// WaitingApproval.js

function WaitingApproval() {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-4">Waiting for Approval</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Display properties waiting for approval */}
      </div>
    </div>
  );
}

// PublicProperties.js
function PublicProperties() {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold mb-4">Public Properties</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Display public properties */}
      </div>
    </div>
  );
}