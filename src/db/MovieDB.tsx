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
type MovieSearchResults = {
  id: number;
}

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

export const searchMovieByTitle = async (movieName: string) => {
  try {
    const response = await fetch((`https://api.themoviedb.org/3/search/movie?query=${movieName}&include_adult=true&language=en-US&page=1`),
      options,
    );
    const data: any = await response.json();
    console.log(data)
    const returnData: MovieSearchResults = data.results[0]
    console.log(returnData)
    return returnData;
  } catch (err) {
    console.error(err)
  }
};
