const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_BEARER_TOKEN}`,
  },
};

type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
};

export const fetchMovieDetails = async (movieId: number) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}`,
      options,
    );
    const data: MovieDetails = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};
