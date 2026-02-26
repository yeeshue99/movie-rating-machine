import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import tempCover from './assets/Test cover httyd.jpg'



function App() {
  const [count, setCount] = useState(0)
  const [rating, setRating] = useState(0)
  const phrases = useRef(null);
  const review = useRef(null);
  const handleonclick = () => {
    console.log("rating " + rating)
    console.log("phrases " + phrases.current.value)
    console.log("review " + review.current.value)
  }

  return (
    <>
      <div className="aboutMovie">
        <img src={tempCover} className="imageCover" alt="Movie Cover Picture" />
        <div id="movieName">
          <h1>How to Train your Dragon</h1>
          <h3><p>A hapless young Viking who aspires to hunt dragons becomes the unlikely friend of a young dragon himself, and learns there may be more to the creatures than he assumed.</p></h3>
        </div>
      </div>
      <div>
        <button onClick={() => setRating(1)}>
          1 star
        </button>
        <button onClick={() => setRating(2)}>
          2 star
        </button>
        <button onClick={() => setRating(3)}>
          3 star
        </button>
        <button onClick={() => setRating(4)}>
          4 star
        </button>
        <button onClick={() => setRating(5)}>
          5 star
        </button>
        <button onClick={() => setRating(6)}>
          6 star
        </button>
        <button onClick={() => setRating(7)}>
          7 star
        </button>
        <button onClick={() => setRating(8)}>
          8 star
        </button>
        <button onClick={() => setRating(9)}>
          9 star
        </button>
        <button onClick={() => setRating(10)}>
          10 star
        </button>
        <br />
        {rating} Stars
      </div>

      <div className="Reviews">
        <textarea ref={phrases} id="phrases" className="oneWordDesc" placeholder="Phrase Descriptors, ex: excessive gore, bl, old film" />
        <textarea ref={review} id="review" className="userReview" placeholder="Thoughts on the movie" />

      </div>
      <button onClick={handleonclick}>
        Save Review
      </button>







      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App
