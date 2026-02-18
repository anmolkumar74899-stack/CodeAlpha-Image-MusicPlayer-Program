// =============================================
// SONG LIST — update title/artist to match your
// actual MP3 files inside the songs/ folder.
// =============================================
const songs = [
  {
    title: "Song 1",
    artist: "Artist One",
    src: "songs/song1.mp3"
  },
  {
    title: "Song 2",
    artist: "Artist Two",
    src: "songs/song2.mp3"
  },
  {
    title: "Song 3",
    artist: "Artist Three",
    src: "songs/song3.mp3"
  }
  // ➕ Add more songs here following the same pattern:
  // { title: "My Track", artist: "My Artist", src: "songs/mytrack.mp3" }
];

// =============================================
// STATE
// =============================================
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

const audio = new Audio();
audio.volume = 0.8;

// =============================================
// DOM REFERENCES
// =============================================
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const titleEl = document.getElementById("song-title");
const artistEl = document.getElementById("song-artist");
const albumArt = document.getElementById("album-art");
const progress = document.getElementById("progress");
const progressFill = document.getElementById("progress-fill");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const volumeSlider = document.getElementById("volume");
const volumeIcon = document.getElementById("volume-icon");
const playlistEl = document.getElementById("playlist");
const playerEl = document.querySelector(".player");

// =============================================
// CORE FUNCTIONS
// =============================================
function loadSong(index) {
  const song = songs[index];
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  audio.src = song.src;
  progress.value = 0;
  progressFill.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  highlightActiveSong();
  // Pulse the album art on track change
  albumArt.classList.remove("spin");
  void albumArt.offsetWidth; // reflow
}

function playPause() {
  if (isPlaying) {
    audio.pause();
    playBtn.innerHTML = "&#9654;";
    albumArt.classList.remove("spin");
    playerEl.classList.remove("playing");
  } else {
    audio.play().catch(err => {
      console.warn("Playback error:", err);
    });
    playBtn.innerHTML = "&#9646;&#9646;";
    albumArt.classList.add("spin");
    playerEl.classList.add("playing");
  }
  isPlaying = !isPlaying;
}

function nextSong() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  loadSong(currentIndex);
  audio.play().catch(() => { });
  isPlaying = true;
  playBtn.innerHTML = "&#9646;&#9646;";
  albumArt.classList.add("spin");
  playerEl.classList.add("playing");
}

function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  audio.play().catch(() => { });
  isPlaying = true;
  playBtn.innerHTML = "&#9646;&#9646;";
  albumArt.classList.add("spin");
  playerEl.classList.add("playing");
}

// =============================================
// PROGRESS BAR
// =============================================
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progress.value = pct;
  progressFill.style.width = pct + "%";
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
});

progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
  progressFill.style.width = progress.value + "%";
});

// =============================================
// VOLUME
// =============================================
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
  updateVolumeIcon();
});

function updateVolumeIcon() {
  const v = audio.volume;
  if (v === 0) volumeIcon.textContent = "🔇";
  else if (v < 0.4) volumeIcon.textContent = "🔈";
  else if (v < 0.7) volumeIcon.textContent = "🔉";
  else volumeIcon.textContent = "🔊";
}

volumeIcon.addEventListener("click", () => {
  if (audio.volume > 0) {
    audio.volume = 0;
    volumeSlider.value = 0;
  } else {
    audio.volume = 0.8;
    volumeSlider.value = 0.8;
  }
  updateVolumeIcon();
});

// =============================================
// SHUFFLE & REPEAT
// =============================================
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextSong();
  }
});

// =============================================
// PLAYLIST UI
// =============================================
function createPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="track-num">${String(index + 1).padStart(2, "0")}</span>
      <span class="track-info">
        <span class="track-title">${song.title}</span>
        <span class="track-artist">${song.artist}</span>
      </span>
      <span class="track-play-icon">▶</span>
    `;
    li.addEventListener("click", () => {
      currentIndex = index;
      loadSong(currentIndex);
      audio.play().catch(() => { });
      isPlaying = true;
      playBtn.innerHTML = "&#9646;&#9646;";
      albumArt.classList.add("spin");
      playerEl.classList.add("playing");
    });
    playlistEl.appendChild(li);
  });
}

function highlightActiveSong() {
  const items = playlistEl.querySelectorAll("li");
  items.forEach((item, i) => {
    item.classList.toggle("active", i === currentIndex);
  });
}

// =============================================
// KEYBOARD SHORTCUTS
// =============================================
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  switch (e.key) {
    case " ": e.preventDefault(); playPause(); break;
    case "ArrowRight": nextSong(); break;
    case "ArrowLeft": prevSong(); break;
    case "ArrowUp":
      audio.volume = Math.min(1, audio.volume + 0.1);
      volumeSlider.value = audio.volume;
      updateVolumeIcon();
      break;
    case "ArrowDown":
      audio.volume = Math.max(0, audio.volume - 0.1);
      volumeSlider.value = audio.volume;
      updateVolumeIcon();
      break;
  }
});

// =============================================
// EVENT LISTENERS
// =============================================
playBtn.addEventListener("click", playPause);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// =============================================
// INIT
// =============================================
createPlaylist();
loadSong(currentIndex);
