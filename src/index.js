import React from 'react';
import {useState} from 'react';
import ReactDOM from 'react-dom/client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

import Matrix from './matrix';

import './index.css'

const root = ReactDOM.createRoot(document.getElementById('app-root'));

function MatrixBox() {

  const [showInfo, setShowInfo] = useState(false);

  let infoPane = null;
  if (showInfo) {
    infoPane = (
      <div className='info-pane'> ALL THE GOODS </div>
    );
  }

  return (

    <div className='box-body'>

      <div className='info-icon'>
        <FontAwesomeIcon 
          className='icon info' 
          size="xl"
          icon={faCircleInfo} 
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