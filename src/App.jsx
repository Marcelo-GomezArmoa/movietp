import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios'
import './App.css';
import YouTube from 'react-youtube';
import "bootstrap/dist/css/bootstrap.min.css";
import logo from './assets/movie.jpg';  // Importa la imagen

function App() {
  const API_URL = "https://api.themoviedb.org/3";
  const API_KEY = "49064ed88de49f9cd1b7c363f057dca6";
  const IMAGE_PATH = "https://image.tmdb.org/t/p/original";

  const URL_IMAGE = "https://image.tmdb.org/t/p/original";

        //VARIABLES DE ESTADO
  const [movies, setMovies] = useState([]);
  const [searchKey, setSearchKey] = useState(""); 
  const [trailer, setTrailer] = useState(null);
  const [movie, setMovie] = useState({ title: "Loading Movies" });
  const [playing, setPlaying] = useState(false);

        //ES PARA REALIZAR LA PETICION POR GET A LA API
const fetchMovies = async (searchKey) => {
  // Determina el tipo de búsqueda.
  const type = searchKey ? "search" : "discover";
  // Realiza la solicitud GET a la API
  const {
    data: { results },
  } = await axios.get(`${API_URL}/${type}/movie`, {
    params: {
      api_key: API_KEY,
      query: searchKey,
    },
  });

  // Actualiza el estado con los resultados de la búsqueda
  setMovies(results);
  // Establece la película actual como la primera de los resultados
  setMovie(results[0]);

  // Si hay resultados, realiza una segunda solicitud para obtener detalles de la primera película
  if (results.length) {
    await fetchMovie(results[0].id);
  }
};


    //FUNC PARA LA PETICION DE UN OBJETO Y MOSTRAR EL TRAILER EN EL REPRODUCTOR DE VIDEOS
const fetchMovie = async (id) => {
  // Realiza la solicitud GET a la API para obtener detalles de una película
  const { data } = await axios.get(`${API_URL}/movie/${id}`, {
    params: {
      api_key: API_KEY,
      append_to_response: "videos",  // A través de esta query busca si existe el video
    },
  });

  // Condicional para validar si existen videos asociados a la película
  if (data.videos && data.videos.results) {
    // Busca el video oficial dentro de los resultados de videos
    const trailer = data.videos.results.find(
      (vid) => vid.name === "Official Trailer"
    );
    // Establece el trailer como estado, o el primer video si no hay un trailer of
    setTrailer(trailer ? trailer : data.videos.results[0]);
  }

  // Actualiza el estado de la película
  setMovie(data);
};


const selectMovie = async (movie) => {
  // Llama a la función fetchMovie para obtener detalles de la película seleccionada
  fetchMovie(movie.id);
  // Actualiza el estado de la aplicación con la película seleccionada
  setMovie(movie);
  // Desplaza la ventana hacia arriba, para mostrar los detalles de la película en la parte superior de la pantalla
  window.scrollTo(0, 0);
};

   // FUNCION PARA EL BUSCADOR DE PELICULAS

const searchMovies = (e) => {
  // Evita que el formulario se envíe automáticamente y recargue la página
  e.preventDefault();
  // Llama a la función fetchMovies para buscar películas según búsqueda actual
  fetchMovies(searchKey);
};


  useEffect(() => {
    fetchMovies();
  }, []);

//posiblemente fav

  const [favorites, setFavorites] = useState([]);
  const toggleFavorite = (selectedMovie) => {
    // Verifica si la película ya está en la lista de favoritos
    if (isFavorite(selectedMovie)) {
      // Si está en la lista, sacala
      const updatedFavorites = favorites.filter((movie) => movie.id !== selectedMovie.id);
      setFavorites(updatedFavorites);
    } else {
      // Si no está en la lista, agregala
      setFavorites([...favorites, selectedMovie]);
    }
  };
  
  const isFavorite = (movie) => {
    // Verifica si la película está en la lista de favoritos
    return favorites.some((favMovie) => favMovie.id === movie.id);
  };
  

  return (
    <div>
      {/* Navegador - navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          {/* Logo */}
          <a className="navbar-brand" href="#">
            <img
              src={logo}
              width="200"
              height="100"
              className="d-inline-block align-top"
              alt="Logo"
            />
            <h2 className="text-center mt-5 mb-5">Trailer Movies</h2>
          </a>


          
          {/* Enlaces que hay que configurar con el react-dom*/}
          <div className="navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto mb-5">
              <li>
                <a className="nav-link" href="#">
                  Inicio
                </a>
              </li>
              <li>
                <a className="nav-link" href="#">
                  Favoritos
                </a>
              </li>
            
              <li>
                <a className="nav-link" href="#">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      

      {/* BUSCADOR DE PELICULAS */}
      <form className="container mb-4" onSubmit={searchMovies}>
        <input
          type="text"
          placeholder="search"
          onChange={(e) => setSearchKey(e.target.value)}
        />
        <button className="btn btn-primary">Search</button>
      </form>
       {/* CONTENEDOR DEL BANNER Y REP DE TRAILER */}
      <div>
        <main>
          {movie ? (
            <div
              className="viewtrailer"
              style={{
                backgroundImage: `url("${IMAGE_PATH}${movie.backdrop_path}")`,
              }}
            >
              {playing ? (
                <>
                  <YouTube
                    videoId={trailer.key}
                    className="reproductor container"
                    containerClassName={"youtube-container"}
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 1,
                        controls: 0,
                        cc_load_policy: 0,
                        fs: 0,
                        iv_load_policy: 0,
                        modestbranding: 0,
                        rel: 0,
                        showinfo: 0,
                      },
                    }}
                  />
                  <button onClick={() => setPlaying(false)} className="boton">
                    Close
                  </button>
                </>
              ) : (
                <div className="container">
                  <div className="">
                    {trailer ? (
                      <button
                        className="boton"
                        onClick={() => setPlaying(true)}
                        type="button"
                      >
                        Play Trailer
                      </button>
                    ) : (
                      "Sorry, no trailer available"
                    )}
                    <h1 className="text-white">{movie.title}</h1>
                    <p className="text-white">{movie.overview}</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>


             {/* AGREGAR Y QUITAR FAV */}
      <div className="container mt-3">
  <h2>Favorites</h2>
  <div className="row">
    {favorites.map((favMovie) => (
      <div key={favMovie.id} className="col-md-4 mb-3">
        <img
          src={`${URL_IMAGE + favMovie.poster_path}`}
          alt=""
          height={600}
          width="100%"
        />
        <h4 className="text-center">{favMovie.title}</h4>
        <button onClick={() => toggleFavorite(favMovie)} className="btn btn-danger">
          Remove from Favorites
        </button>
      </div>
    ))}
  </div>
</div>


{/* LOGRAR QUE LOS FAVORITOS APAREZCAN EN UN LISTA EN OTRA PANTALLA PARA ESO DEBO UTILIZAR REACT DOM 
TAMBIEN CUANDO SE HACE CLICK EN INICIO REFRESQUE LA PAG, */}
    

       {/* CONTAINER QUE VA A MOSTRAR POSTERS DE LAS PELICULAS CUANDO SE HAGA LA PETICION DE LA API */}
      <div className="container mt-3">
        <div className="row">
          
          {movies.map((movie) => (
  <div key={movie.id} className="col-md-4 mb-3">
    <img
      src={`${URL_IMAGE + movie.poster_path}`}
      alt=""
      height={600}
      width="100%"
      onClick={() => selectMovie(movie)}
    />
    <h4 className="text-center">{movie.title}</h4>
    <button onClick={() => toggleFavorite(movie)} className="btn btn-primary">
      {isFavorite(movie) ? "Remove from Favorites" : "Add to Favorites"}
    </button>
  </div>
))}

        </div>
      </div>
    </div>
  );
}

export default App;
