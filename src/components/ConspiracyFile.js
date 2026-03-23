import React, { useRef, useEffect } from 'react';
import Typewriter from 'typewriter-effect';


const ConspiracyFile = ({
  image,
  title,
  prompt,
  description,
  onClose,
  pickedCount,
  isSelected,
}) => {

  
// Use useRef to hold the audio instance
const typingAudioRef = useRef(null);

// Initialize the audio when the component mounts
useEffect(() => {
  typingAudioRef.current = new Audio('./sounds/typing.wav');
  typingAudioRef.current.volume = 0.6;
  
  // Pause audio when component unmounts
  return () => {
    if (typingAudioRef.current) {
      typingAudioRef.current.pause();
    }
  };
}, []);

// onClose handler to pause audio
const handleClose = () => {
  if (typingAudioRef.current) {
    typingAudioRef.current.pause();
  }
  onClose(); 
}


  return (
    
    <div className='file-div-bg'>
      <div className="file-div" id="file-div">
        <div className="left-overlay-div">
          <div className="card">
            <img
              src={`/images/${image}`}
              alt={title}
              className="file-img"
            />
            <h2 className="file-title">{title}</h2>
          </div>
        </div>
        <div className="right-overlay-div">
          <p className="file-para-title">{title}</p>

            <div className="file-para">
              <Typewriter
                onInit={(typewriter) => {
                typewriter
                  .changeDelay(40)
                  .typeString(description)
                  .callFunction(() => {
                    console.log('String typed out!');
                    if (typingAudioRef.current) {
                      typingAudioRef.current.pause();
                    }
                  })
                  .start();
                if (typingAudioRef.current) {
                  typingAudioRef.current.play();
                  typingAudioRef.current.loop = true;
                }   
                }}
              />
            </div>
          
          <button onClick={handleClose} className="file-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConspiracyFile;