// Navigation.js
import React from 'react';
// import { span } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span
            //  to="/" 
             className="text-xl font-bold text-gray-800">
              Real Estate App
            </span>
          </div>
          <div className="hidden md:block">
            <ul className="flex space-x-4">
              <li>
                <span
                  // to="/"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                >
                  My Properties
                </span>
              </li>
              <li>
                <span
                  // to="/publish"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                >
                  Publish Property
                </span>
              </li>
              <li>
                <span
                  // to="/approvals"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                >
                  Approval Requests
                </span>
              </li>
              <li>
                <span
                  // to="/waiting-approval"
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                >
                  Waiting Approval
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;