import { useState } from "react";
import ConspiracyFile from "./ConspiracyFile";
import ReactCardFlip from "./react-card-flip";

const ConspiracyPreview = ({
  image,
  title,
  prompt,
  description,
  pickedCount,
  setPickedCount,
  onSelect,
  isSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);


  const handleCardClick = () => {
    if (hasBeenViewed || pickedCount >= 10 || isSelected) return;
    if (typeof prompt !== 'string' || prompt.trim() === '') {
      console.error('Invalid prompt in ConspiracyPreview:', prompt);
      return;
    }
    console.log('Clicked card, prompt:', prompt, 'pickedCount before:', pickedCount); // Debug
    onSelect(prompt, true); // Add prompt to selectedPrompts
    setPickedCount(prev => {
      const newCount = Math.min(prev + 1, 10);
      console.log('New pickedCount:', newCount); // Debug
      return newCount;
    });
    setIsOpen(true); // Open ConspiracyFile
    
    
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFlipped(true); // Flip to front
    setHasBeenViewed(true); // Mark as viewed
    
  };




  // If the overlay is open, render ConspiracyFile
  if (isOpen) {
    return (
      <ConspiracyFile
        image={image}
        title={title}
        prompt={prompt}
        description={description}
        onClose={handleClose}
        pickedCount={pickedCount}
        isSelected={isSelected}
      />
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className={`first-div ${hasBeenViewed ? "inactive" : ""} ${isSelected ? "border-2 border-blue-500" : ""}`}
    >
      <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
        <div className="card card-back">
          <img
            src={`/images/cardBack.jpg`}
            className="preview-img"
            alt="Card Back"
          />
        </div>
        <div className="card card-front">
          <img
            src={`/images/${image}`}
            className="preview-img"
            alt={title}
          />
        </div>
      </ReactCardFlip>
    </div>
  );
};

export default ConspiracyPreview;