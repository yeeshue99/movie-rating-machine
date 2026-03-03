import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import StarButton from "./components/StarButton";
import { useDatabase } from "./db/Database";
import { fetchMovieDetails } from "./db/MovieDB";

const STORE = "movies";

interface Movie {
  id?: number;
  title: string;
  rating: number;
  phrase: string;
  review: string;
}

type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
};

function App() {
  const [rating, setRating] = useState(0);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const { connector, isLoading, error } = useDatabase();

  useEffect(() => {

    const loadMovieDetails = async () => {
      const details = await fetchMovieDetails(10191);
      if (details) setMovieDetails(details);
    };
    loadMovieDetails();
  }, []);

  const [movies, setMovies] = useState<Movie[]>([]);

  const phrases = useRef<HTMLTextAreaElement>(null);
  const review = useRef<HTMLTextAreaElement>(null);
  const search = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const all = await connector.getAll<Movie>(STORE);
    setMovies(all);
  }, [connector]);

  const handleonclick = () => {
    if (!phrases.current || !review.current) {
      console.error("Textarea refs are not set");
      return;
    }
    if (!movieDetails) {
      return
    };
    saveReview(
      movieDetails.title,
      rating,
      phrases.current.value,
      review.current.value,
    );
    console.log("Phrases: " + phrases.current.value);
    console.log("Review: " + review.current.value);
    console.log("rating " + rating);
  };

  const handleSearch = () => {
    if (!search.current) {
      console.error("no search")
      return
    };
    console.log("you searched " + search.current.value)
    var newSearchValue: number
    newSearchValue = Number(search.current.value)

    const loadMovieDetails = async () => {
      const details = await fetchMovieDetails(newSearchValue);
      if (details) setMovieDetails(details);
    };
    loadMovieDetails();

  }

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
      <div className="searchMovies">
        <input type="number" className="searchBox" ref={search} />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="aboutMovie">
        <img
          src={
            movieDetails?.poster_path
              ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
              : undefined
          }
          className="imageCover"
          alt="Movie Cover Picture"
        />
        <div id="movieName">
          <h1>{movieDetails?.title}</h1>
          <h3>
            <p>{movieDetails?.overview}</p>
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
