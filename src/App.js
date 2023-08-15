import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import StoryHistory from './components/StoryHistory';

function App() {
  const [prompt, setPrompt] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storyHistory, setStoryHistory] = useState([]);
  const [customAuthor, setCustomAuthor] = useState('');
  const [customGenre, setCustomGenre] = useState('');

  const authors = [
    "J.K. Rowling", 
    "William Shakespeare", 
    "Stephen King", 
    "Jane Austen", 
    "Mark Twain", 
    "George Orwell", 
    "Agatha Christie", 
    "J.R.R. Tolkien", 
    "Isaac Asimov", 
    "Maya Angelou"
  ];
  
  const genres = [
    "Horror", 
    "Comedy", 
    "Adventure", 
    "Romance", 
    "Mystery", 
    "Fantasy", 
    "Science Fiction", 
    "Historical", 
    "Thriller", 
    "Drama"
  ];
  
  const ageGroups = [
    "Board Books (0-3)", 
    "Picture Books (3-8)", 
    "Middle Grade (8-12)", 
    "Young Adult (12-18)", 
    "New Adult (18-30)", 
    "Adult (30+)"
  ];  

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleAuthorChange = (event) => {
    setAuthor(event.target.value);
  };

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
  };

  const handleAgeGroupChange = (event) => {
    setAgeGroup(event.target.value);
  };

  const handleCustomAuthorChange = (event) => {
    setCustomAuthor(event.target.value);
  };
  
  const handleCustomGenreChange = (event) => {
    setCustomGenre(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const chosenAuthor = customAuthor || author;
    const chosenGenre = customGenre || genre;

    const messageContent = `Write a ${chosenGenre} story. ${prompt} in the style of ${chosenAuthor} for the age group ${ageGroup}.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: messageContent
            }
        ],
        max_tokens: 100,
      }, {
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json'
        }
      });

      setOutput(response.data.choices[0].message.content.split('\n\n'));
      
      const storyContent = response.data.choices[0].message.content.split('\n\n').join(' ');  // Converting paragraphs to a single string for the history list
      setStoryHistory([storyContent, ...storyHistory]);

      const storyDetails = {
        content: response.data.choices[0].message.content.split('\n\n').join(' '),
        prompt,
        author,
        genre,
        ageGroup
      };
  
      setStoryHistory([storyDetails, ...storyHistory]);
      setAgeGroup('');
      setPrompt('');
      setGenre('');
      setAuthor('');
      setCustomAuthor('');
      setCustomGenre('');

    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};

const continueStory = async (lastParagraph, author, genre, ageGroup) => {
  setLoading(true);

  const continuationPrompt = `Continue this ${genre} story. ${lastParagraph} in the style of ${author} for the age group ${ageGroup}.`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: continuationPrompt
        }
      ],
      max_tokens: 100,
    }, {
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json'
      }
    });

    const newParagraphs = response.data.choices[0].message.content.split('\n\n');
    const updatedStory = [...output, ...newParagraphs].join('\n\n');

    setOutput(updatedStory.split('\n\n'));

    // Find the index of the last story in the history that you want to continue
    const lastIndex = storyHistory.findIndex(story => story.content === lastParagraph);

    if (lastIndex !== -1) {
      const updatedStoryHistory = [...storyHistory];
      updatedStoryHistory[lastIndex].content = updatedStory;
      setStoryHistory(updatedStoryHistory);
    }

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="App">
      <div className="app-content">
        <StoryHistory 
            history={storyHistory} 
            continueStory={continueStory}
            currentParams={{ author, genre, ageGroup }}
          />
        <form onSubmit={handleSubmit}>
          <h1>What is Your Story About?</h1>
          <select value={genre} onChange={handleGenreChange}>
            <option value="">Give me a __ story.</option>
            {genres.map((genre, index) => <option key={index} value={genre}>{genre}</option>)}
          </select>
          <input 
            type="text" 
            value={customGenre} 
            onChange={handleCustomGenreChange} 
            placeholder="Or your own genre..."
          />
          <textarea value={prompt} onChange={handlePromptChange} placeholder="(shorter is better!) it's a story about..."/>
          <select value={author} onChange={handleAuthorChange}>
            <option value="">In the style of...</option>
            {authors.map((author, index) => <option key={index} value={author}>{author}</option>)}
          </select>
          <input 
            type="text" 
            value={customAuthor} 
            onChange={handleCustomAuthorChange} 
            placeholder="Don't see your favorite author?"
          />
          <select value={ageGroup} onChange={handleAgeGroupChange}>
            <option value="">For the age group...</option>
            {ageGroups.map((ageGroup, index) => <option key={index} value={ageGroup}>{ageGroup}</option>)}
          </select>
          <div className="button-contain">
            <button type="submit" className="create-button">Create</button>
          </div>
        </form>
      </div>
      <div className="story-div">
        <h2>Your Story:</h2>
        {loading ? <p>Loading...</p> : (
          <>
            {output.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
