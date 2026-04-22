"use strict";

const MOVIES_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/movies.json";
let allMovies = [];

const movieList   = document.querySelector("#movie-list");
const genreSelect = document.querySelector("#genre-select");
const searchInput = document.querySelector("#search-input");
const sortSelect  = document.querySelector("#sort-select");
const movieCount  = document.querySelector("#movie-count");
const dialog      = document.querySelector("#movie-dialog");

/* ── Fetch ── */
fetchMovies();

async function fetchMovies() {
  try {
    const response = await fetch(MOVIES_URL);
    allMovies = await response.json();
    populateGenreSelect();
    applyFiltersAndSort();
  } catch (err) {
    movieList.innerHTML = '<p class="empty">Kunne ikke hente film. Tjek din forbindelse.</p>';
  }
}

/* ── Genre dropdown ── */
function populateGenreSelect() {
  const genres = new Set();
  for (const movie of allMovies) {
    for (const genre of movie.genre) genres.add(genre);
  }
  const sorted = [...genres].sort((a, b) => a.localeCompare(b, "da"));
  for (const genre of sorted) {
    genreSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${genre}">${genre}</option>`
    );
  }
}

/* ── Filter & Sort ── */
function applyFiltersAndSort() {
  const selectedGenre = genreSelect.value;
  const searchValue   = searchInput.value.trim().toLowerCase();
  const sortOption    = sortSelect.value;

  let filtered = allMovies.filter(movie => {
    const matchesGenre  = selectedGenre === "all" || movie.genre.includes(selectedGenre);
    const matchesSearch = movie.title.toLowerCase().includes(searchValue);
    return matchesGenre && matchesSearch;
  });

  if (sortOption === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title, "da"));
  } else if (sortOption === "year") {
    filtered.sort((a, b) => b.year - a.year);
  } else if (sortOption === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  showMovies(filtered);
}

/* ── Render list ── */
function showMovies(movies) {
  movieList.innerHTML = "";
  movieCount.textContent = `Viser ${movies.length} ud af ${allMovies.length} film`;

  if (movies.length === 0) {
    movieList.innerHTML = '<p class="empty">Ingen film matcher din søgning.</p>';
    return;
  }

  for (const movie of movies) showMovie(movie);
}

/* ── Render single card ── */
function showMovie(movie) {
  const isHighlight = movie.rating >= 8.5;
  const html = /* html */ `
    <article class="movie-card${isHighlight ? " movie-card--highlight" : ""}" tabindex="0" role="button" aria-label="Åbn detaljer for ${movie.title}">
      <img
        src="${movie.image}"
        alt="Filmplakat for ${movie.title}"
        class="movie-poster"
        loading="lazy"
      />
      <div class="movie-info">
        <div class="title-row">
          <h2>${movie.title}</h2>
          <span class="year-badge">${movie.year}</span>
        </div>
        <p class="genre">${movie.genre.join(" · ")}</p>
        <p class="movie-rating">★ ${movie.rating}</p>
        <p class="director-line"><strong>Instruktør:</strong> ${movie.director}</p>
      </div>
    </article>
  `;

  movieList.insertAdjacentHTML("beforeend", html);

  const card = movieList.lastElementChild;
  card.addEventListener("click",   () => showMovieDialog(movie));
  card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") showMovieDialog(movie); });
}

/* ── Dialog ── */
function showMovieDialog(movie) {
  const dialogContent = document.querySelector("#dialog-content");

  dialogContent.innerHTML = /* html */ `
    <img
      src="${movie.image}"
      alt="Filmplakat for ${movie.title}"
      class="movie-poster"
    />
    <div class="dialog-details">
      <h2>${movie.title} <span class="movie-year">(${movie.year})</span></h2>
      <p class="movie-genre">${movie.genre.join(" · ")}</p>
      <p class="movie-rating">★ ${movie.rating} / 10</p>
      <p><strong>Instruktør:</strong> ${movie.director}</p>
      <p><strong>Medvirkende:</strong> ${movie.actors.join(", ")}</p>
      <p class="movie-description">${movie.description}</p>
    </div>
  `;

  dialog.showModal();
}

/* ── Close dialog on backdrop click ── */
dialog.addEventListener("click", e => {
  const rect = dialog.getBoundingClientRect();
  const clickedOutside =
    e.clientX < rect.left  ||
    e.clientX > rect.right ||
    e.clientY < rect.top   ||
    e.clientY > rect.bottom;
  if (clickedOutside) dialog.close();
});

/* ── Event listeners ── */
genreSelect.addEventListener("change", applyFiltersAndSort);
searchInput.addEventListener("input",  applyFiltersAndSort);
sortSelect.addEventListener("change",  applyFiltersAndSort);
