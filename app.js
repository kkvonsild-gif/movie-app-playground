"use strict";

const MOVIES_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/movies.json";
let allMovies = [];

const movieList = document.querySelector("#movie-list");
const genreSelect = document.querySelector("#genre-select");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const movieCount = document.querySelector("#movie-count");




fetchMovies();

async function fetchMovies() {  
  const response = await fetch(MOVIES_URL);
  allMovies = await response.json();

  populateGenreSelect();
  applyFiltersAndSort();
}





function populateGenreSelect() {
  const genres = new Set();

  for (const movie of allMovies) {
    for (const genre of movie.genre) {
      genres.add(genre);
    }
  }

  const sortedGenres = [...genres].sort((a, b) => a.localeCompare(b));

  for (const genre of sortedGenres) {
    genreSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${genre}">${genre}</option>`,
    );
  }
}




function applyFiltersAndSort() {
  const selectedGenre = genreSelect.value;
  const searchValue = searchInput.value.trim().toLowerCase();
  const sortOption = sortSelect.value;

  let filteredMovies = allMovies.filter(function (movie) {
    const matchesGenre =
      selectedGenre === "all" || movie.genre.includes(selectedGenre);
    const matchesSearch = movie.title.toLowerCase().includes(searchValue);

    return matchesGenre && matchesSearch;
  });

  if (sortOption === "title") {
    filteredMovies.sort(function (movieA, movieB) {
      return movieA.title.localeCompare(movieB.title);
    });
  } else if (sortOption === "year") {
    filteredMovies.sort(function (movieA, movieB) {
      return movieB.year - movieA.year;
    });
  } else if (sortOption === "rating") {
    filteredMovies.sort(function (movieA, movieB) {
      return movieB.rating - movieA.rating;
    });
  }

  showMovies(filteredMovies);
}




function showMovies(movies) {
  movieList.innerHTML = "";
  movieCount.textContent = `Viser ${movies.length} ud af ${allMovies.length} film`;

  if (movies.length === 0) {
    movieList.innerHTML =
      '<p class="empty">Ingen film matcher din søgning eller genre.</p>';
    return;
  }

  for (const movie of movies) {
    showMovie(movie);
  }
}




function showMovie(movie) {
  const html = /* html */ `
    <article class="movie-card" tabindex="0">
      <img src="${movie.image}" alt="Poster af ${movie.title}" class="movie-poster" />
      <div class="movie-info">
        <div class="title-row">
          <h2>${movie.title}</h2>
          <span class="year-badge">(${movie.year})</span>
        </div>
        <p class="genre">${movie.genre.join(", ")}</p>
        <p class="movie-rating">⭐ ${movie.rating}</p>
        <p class="director-line"><strong>Instruktør:</strong> ${movie.director}</p>
      </div>
    </article>
  `;

  movieList.insertAdjacentHTML("beforeend", html);

  const newCard = movieList.lastElementChild;
  newCard.addEventListener("click", function () {
    showMovieDialog(movie);
  });
  newCard.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    showMovieDialog(movie);
  }
  });
}




function showMovieDialog(movie) {
  const dialog = document.querySelector("#movie-dialog");
  const dialogContent = document.querySelector("#dialog-content");

  dialogContent.innerHTML = /* html */ `
    <img src="${movie.image}" alt="Poster af ${movie.title}" class="movie-poster">
    <div class="dialog-details">
      <h2>${movie.title} <span class="movie-year">(${movie.year})</span></h2>
      <p class="movie-genre">${movie.genre.join(", ")}</p>
      <p class="movie-rating">⭐ ${movie.rating}</p>
      <p><strong>Instruktør:</strong> ${movie.director}</p>
      <p><strong>Skuespillere:</strong> ${movie.actors.join(", ")}</p>
      <p class="movie-description">${movie.description}</p>
    </div>
  `;

  dialog.showModal();
}



genreSelect.addEventListener("change", applyFiltersAndSort);
searchInput.addEventListener("input", applyFiltersAndSort);
sortSelect.addEventListener("change", applyFiltersAndSort);

