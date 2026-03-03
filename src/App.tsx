import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import tempCover from "./assets/Test cover httyd.jpg";
import StarButton from "./components/StarButton";
import { useDatabase } from "./db/Database";

const STORE = "movies";

interface Movie {
  id?: number;
  title: string;
  rating: number;
  phrase: string;
  review: string;
}

function App() {
  const [rating, setRating] = useState(0);
  const currentMovieTitle: string
  const currentMoviePicture
  const { connector, isLoading, error } = useDatabase();

  const [movies, setMovies] = useState<Movie[]>([]);

  const phrases = useRef<HTMLTextAreaElement>(null);
  const review = useRef<HTMLTextAreaElement>(null);

  const refresh = useCallback(async () => {
    const all = await connector.getAll<Movie>(STORE);
    setMovies(all);
  }, [connector]);

  const handleonclick = () => {
    if (!phrases.current || !review.current) {
      console.error("Textarea refs are not set");
      return;
    }
    saveReview(currentMovieTitle, rating, phrases.current.value, review.current.value)
    console.log("Phrases: " + phrases.current.value);
    console.log("Review: " + review.current.value);
    console.log("rating " + rating);
  };

  useEffect(() => {
    if (!isLoading) {
      connector.getAll<Movie>(STORE).then(setMovies);
    }
  }, [isLoading, connector]);

  const saveReview = async (
    title: string,
    rating: number,
    phrasesValue: string,
    reviewValue: string,
  ) => {
    if (
      !title.trim() ||
      rating === 0 ||
      !phrasesValue.trim() ||
      !reviewValue.trim()
    )
      return;
    await connector.put<Movie>(STORE, {
      title: title.trim(),
      rating: Number(rating),
      phrase: phrasesValue,
      review: reviewValue,
    });
    setRating(0);
    await refresh();
  };

  const deleteReview = async (id: number) => {
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
          <h1>{currentMovieTitle}</h1>
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
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <StarButton key={n} value={n} rating={rating} onClick={setRating} />
        ))}
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
      <button onClick={handleonclick}>Save Review</button>
      {movies.map((movie) => (
        <div key={movie.id} className="movieReview">
          <h2>{movie.title}</h2>
          <p>Rating: {movie.rating} Stars</p>
          <p>Phrases: {movie.phrase}</p>
          <p>Review: {movie.review}</p>
          <button onClick={() => deleteReview(movie.id!)}>Delete</button>
        </div>
      ))}
    </>
  );
}

export default App;
