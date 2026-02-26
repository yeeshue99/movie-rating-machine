import { useEffect, useRef, useState, useCallback } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import tempCover from "./assets/Test cover httyd.jpg";
import emptyStar from './assets/empty star.png'
import "./App.css";
import { useDatabase } from "./db/Database";
import "./App.css";

const STORE = "movies";

interface Movie {
  id?: number;
  title: string;
  rating: number;
  phrase: string;
  review: string;
}

function App() {
  const [count, setCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [star, setStar] = useState(false)
  const { connector, isLoading, error } = useDatabase();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState("");


  // i might need you to explain to me what this is and how to implement it into my current changes
  // const [rating, setRating] = useState<number | "">("");


  const phrases = useRef(null);
  const review = useRef(null);

  const refresh = useCallback(async () => {
    const all = await connector.getAll<Movie>(STORE);
    setMovies(all);
  }, [connector]);

  const handleonclick = () => {
    console.log("rating " + rating);
    console.log("phrases " + phrases.current.value);
    console.log("review " + review.current.value);
  };

  useEffect(() => {
    if (!isLoading) {
      connector.getAll<Movie>(STORE).then(setMovies);
    }
  }, [isLoading, connector]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || rating === "") return;
    await connector.put<Movie>(STORE, {
      title: title.trim(),
      rating: Number(rating),
      phrase: phrases.current.value,
      review: review.current.value,
    });
    setTitle("");
    setRating("");
    await refresh();
  };

  const handleDelete = async (id: number) => {
    await connector.delete(STORE, id);
    await refresh();
  };

  if (isLoading) return <p>Opening database…</p>;
  if (error) return <p style={{ color: "red" }}>Database error: {error}</p>;

  return (
    <>
      <div className="aboutMovie">
        <img src={tempCover} className="imageCover" alt="Movie Cover Picture" />
        <div id="movieName">
          <h1>How to Train your Dragon</h1>
          <h3>
            <p>
              A hapless young Viking who aspires to hunt dragons becomes the
              unlikely friend of a young dragon himself, and learns there may be
              more to the creatures than he assumed.
            </p>
          </h3>
        </div>
      </div>
      <div>
        <button onClick={() => { setStar(prev => !prev); setRating(1); }} className={`starButton ${star ? "active" : "inactive"}`} id='oneStar'>
          <svg viewBox='0 0 100 100' className='star-icon'>
            <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" />
          </svg>

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
        <textarea
          ref={phrases}
          id="phrases"
          className="oneWordDesc"
          placeholder="Phrase Descriptors, ex: excessive gore, bl, old film"
        />
        <textarea
          ref={review}
          id="review"
          className="userReview"
          placeholder="Thoughts on the movie"
        />
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
      <button onClick={handleonclick}>Save Review</button>
    </>
  );
}

export default App;
