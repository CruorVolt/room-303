import React from 'react';
import {useState} from 'react';
import ReactDOM from 'react-dom/client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';

import Matrix from './matrix';

import './index.css'

const root = ReactDOM.createRoot(document.getElementById('app-root'));

function MatrixBox() {

  const [showInfo, setShowInfo] = useState(false);

  let infoPane = null;
  if (showInfo) {
    infoPane = (
      <div className='info-pane'> 
        <div className='info-pane-item'> A real-time streaming sample of new submissions to Reddit. </div>
        <div className='info-pane-item'><a href='https://github.com/CruorVolt/room-303'> Project Source </a> </div>
        <div className='info-pane-item'> Made by <a href='https://anderslundgren.dev'> Anders Lundgren </a> </div>
      </div>
    );
  }

  return (

    <div className='box-body'>

      <div className='info-icon'>
        <FontAwesomeIcon 
          className='icon info' 
          size="xl"
          icon={showInfo ? faX : faCircleInfo} 
          onClick={() => { setShowInfo(!showInfo)}} 
        />
      </div>

      {infoPane}

      <div className='canvas-container'>
        <Matrix/>
      </div>
    </div>
  );
}

root.render(
  <React.StrictMode>
    <MatrixBox/>
  </React.StrictMode>
);