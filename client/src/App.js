import React, {useState} from 'react';
import AppNavbar from './components/AppNavbar'
import GraphVis from './components/GraphVis'
//import CasesList from './components/CasesList'
import axios from 'axios'
import './App.css';
//import * as d3 from 'd3'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <div className="App">
      <AppNavbar />
      <input type="text" />
        <button>Add Case</button>
        <button>Delete Case</button>
      <GraphVis />
    </div>
  );
}

// <CasesList />
export default App;
