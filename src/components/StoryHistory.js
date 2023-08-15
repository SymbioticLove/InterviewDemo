import React, { useState, useEffect } from 'react';
import './StoryHistory.css';

function StoryHistory({ history, continueStory, currentParams }) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getTitle = (storyDetails) => {
    const firstSentence = storyDetails.content.split(/[.!?]/)[0];
    
    if (firstSentence.length <= 50) return firstSentence + '.';
    
    return firstSentence.substring(0, 47) + '...';
  };

  const handleStoryClick = (event, content) => {
    event.stopPropagation();
    if (isModalOpen) {
      closeModal();
      return;
    }
    setCurrentStory(content);
    setIsTransitioning(true);
    setTimeout(() => {
      setIsModalOpen(true);
    }, 10);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsTransitioning(true);
  };

  useEffect(() => {
    if (isModalOpen) {
      setIsTransitioning(false);
    }
  }, [isModalOpen]);

  const downloadStoryAsTextFile = (content) => {
    // Generate filename using the first 7 characters of the story
    const filename = content.substring(0, 7) + '....txt';

    // Create a blob from the content
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    document.body.appendChild(element); 
    element.click(); 
    document.body.removeChild(element);
  };

  return (
    <div className="story-history">
      <h2>Story History</h2>
      <ul>
        {history.map((storyDetails, index) => (
          <li key={index}>
            <span onClick={(event) => handleStoryClick(event, storyDetails.content)}>
              {getTitle(storyDetails)}
            </span>
            <details>
              <summary>Details</summary>
              <p><strong>Prompt:</strong> {storyDetails.prompt}</p>
              <p><strong>Author Style:</strong> {storyDetails.author}</p>
              <p><strong>Genre:</strong> {storyDetails.genre}</p>
              <p><strong>Age Group:</strong> {storyDetails.ageGroup}</p>
            </details>
          </li>
        ))}
      </ul>

      {(isModalOpen || isTransitioning) && (
        <div className={`modal-background ${isModalOpen ? 'show' : ''}`} onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
          {currentStory.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
            <button 
                onClick={() => downloadStoryAsTextFile(currentStory)}
                className='dl-button'
                >
                Download Story
            </button>
            <button 
              onClick={() => {
                const previousStory = currentStory;
                
                continueStory(previousStory, currentParams.author, currentParams.genre, currentParams.ageGroup);
                closeModal();  // Close the modal after continuing the story
              }}
              className='continue-button'
            >
              Continue Story
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoryHistory;
