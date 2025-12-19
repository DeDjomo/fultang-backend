/* eslint-disable no-unused-vars */
import React from 'react';
import { PharmacyDashboard } from './PharmacyDashboard.jsx';
import { PharmacyNavbar } from './PharmacyNavBar.jsx';
import { PharmacyFilter } from './PharmacyFilter.jsx';
import { PharmacyBoard } from './PharmacyBoard.jsx';
import { PharmacyOperations } from './PharmacyOperations.jsx';


export  function Pharmacy() {


  return (
    <>
      <PharmacyDashboard>
        <div className="h-full flex flex-col">
          <PharmacyNavbar username="Username.N" />
          <div className="flex-1 flex">
            <div className="flex-1 p-4 space-y-4">
              <PharmacyFilter />
              <PharmacyBoard />
            </div>
            <div className="w-80 border-l">
              <PharmacyOperations />
            </div>
          </div>
        </div>
      </PharmacyDashboard>
    </>
    
  );
}