import { useEffect, useRef, useState, useCallback } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import tempCover from "./assets/Test cover httyd.jpg";
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
  const { connector, isLoading, error } = useDatabase();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState<number | "">("");
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
        <button onClick={() => setRating(1)}>1 star</button>
        <button onClick={() => setRating(2)}>2 star</button>
        <button onClick={() => setRating(3)}>3 star</button>
        <button onClick={() => setRating(4)}>4 star</button>
        <button onClick={() => setRating(5)}>5 star</button>
        <button onClick={() => setRating(6)}>6 star</button>
        <button onClick={() => setRating(7)}>7 star</button>
        <button onClick={() => setRating(8)}>8 star</button>
        <button onClick={() => setRating(9)}>9 star</button>
        <button onClick={() => setRating(10)}>10 star</button>
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
      <button onClick={handleonclick}>Save Review</button>
    </>
  );
}

export default App;
