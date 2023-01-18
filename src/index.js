import React from 'react';
import {useState, useRef, useEffect} from 'react';
import ReactDOM from 'react-dom/client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import Matrix from './matrix';

import './index.css'

const root = ReactDOM.createRoot(document.getElementById('app-root'));
const defaultSub = 'Popular';

function MatrixBox() {

  const [showInfo, setShowInfo] = useState(false);
  const [subreddits,  setSubreddits] = useState([]);
  const nodeRef = useRef(null);

  const addSubreddit = (name) => {
    let newSubreddits = Array.from(subreddits);
    newSubreddits.push(name);
    setSubreddits(newSubreddits);
  }

  const removeSubreddit = (name) => {
    let newSubreddits = [];
    for (let existingName of subreddits) {
      if (name !== existingName) {
        newSubreddits.push(existingName);
      }
    }
    setSubreddits(newSubreddits);
  }

  let infoPane = null;
  if (!showInfo) {
    infoPane = (

      <div ref={nodeRef} className='info-pane'> 
        <div className='info-pane-item'> A real-time streaming sample of new submissions to Reddit. </div>

        <div>
          Streaming from: { subreddits.map( (r) => {
            return <Subreddit name={r} remove={() => {removeSubreddit(r);}}/>;
          }) }
        </div>

        <div className='add-entry-container'>
          <AddEntry add={addSubreddit}/>
        </div>

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
        { /* <Matrix/> */ }
      </div>
    </div>
  );
}

function AddEntry(props) {
  const [isTyping, setIsTyping] = useState(true);
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const typingTimer = useRef(null);

  const confirmEntry = (value) => {
    value && props.add && props.add(value);
  }

  useEffect(() => {
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {

      let currentError = null;

      if (!value) {

      } else if (value.length > 21) {
        currentError = 'Name must be 21 characters or fewer';
      } else if (value.length < 3) {
        currentError = 'Name must be at least 3 characters';
      } else if (value.match(/[^A-Z^a-z^_]/)) {
        currentError = 'Name can only contain letters and underscore ("_") characters';
      }
      setErrorMessage(currentError);
    }, 500);
  }, [value]);

  if (isTyping) {

    let validName = value && (value.length < 22) && (value.length > 3);

    return (
      <div>
        <span className='add-entry-input-row'>
          <input type='text' 
            className='add-entry-text-input' 
            placeholder='Enter subreddit name' 
            value={value} 
            onChange={(e) => { setValue(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmEntry(e.target.value); }}
          />
          <FontAwesomeIcon icon={faCheck} className='add-entry-icon-button' title='Confirm' onClick={ () => { confirmEntry(value); }}/>
          <FontAwesomeIcon icon={faX} className='add-entry-icon-button' title='Cancel' onClick={() => { setIsTyping(false); setValue('')}}/>
        </span>
        {errorMessage && errorMessage}
      </div>
    );
  } else {
    return <span className='add-entry' onClick={ () => {setIsTyping(true); }}>
      <FontAwesomeIcon  icon={faPlus} size='lg'/>
      Add Subreddit
    </span>;
  }
}

function Subreddit(props) {
  return <span className='subreddit'> 
    <FontAwesomeIcon icon={faX} onClick={props.remove} className='remove-button' title='Remove'/>
    { props.name } 
  </span>
}

root.render(
  <React.StrictMode>
    <MatrixBox/>
  </React.StrictMode>
);