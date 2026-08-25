import { HuntWikeloGame } from "./game.js";

const canvas = document.getElementById("game");
if (!canvas) throw new Error("Canvas #game nicht gefunden.");

const overlay = document.getElementById("overlay");
const overlayTitle = overlay.querySelector("h1");
const overlayText = overlay.querySelector("p");

const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const btnFullscreen = document.getElementById("btnFullscreen");

const shipSelection = document.getElementById("shipSelection");
const shipCutlass = document.getElementById("shipCutlass");
const shipHullC = document.getElementById("shipHullC");
const shipAgeCheck = document.getElementById("shipAgeCheck");

const volumeControl = document.getElementById("volumeControl");
const volumeSlider = document.getElementById("volumeSlider");

let game = null;
let selectedShipIndex = 0;
let selectedVolume = Number(volumeSlider.value) / 100;

function updateShipSelection() {
    selectedShipIndex = shipAgeCheck.checked ? 1 : 0;
    shipCutlass.classList.toggle("active", selectedShipIndex === 0);
    shipHullC.classList.toggle("active", selectedShipIndex === 1);
}

shipAgeCheck.addEventListener("change", updateShipSelection);

volumeSlider.addEventListener("input", () => {
    selectedVolume = Number(volumeSlider.value) / 100;

    if (game) {
        game.SFX_VOL = selectedVolume;
        game.MUSIC_VOL = selectedVolume;
        game.music?._applyVolume?.();
    }
});

function setRunning(running) {
    btnStart.disabled = running;
    btnStop.disabled = !running;
    overlay.style.display = running ? "none" : "flex";

    if (!running) {
        overlayTitle.textContent = "Hunt Wikelo";
        overlayText.textContent = "Drück Start oder Enter."
        shipSelection.style.display = "grid";
        volumeControl.style.display = "flex";
        btnStart.disabled = false;
        btnStart.textContent = "Start";
    }
}

function setPaused() {
    overlay.style.display = "flex";
    overlayTitle.textContent = "Pause";
    overlayText.textContent = "Enter: Fortsetzen · Escape: Spiel beenden";
    shipSelection.style.display = "none";
    btnStart.disabled = false;
    btnStart.textContent = "Zurück"
    btnStop.disabled = false;
}

function setGameOver() {
    overlay.style.display = "flex";
    overlayTitle.textContent = "Game Over";
    overlayText.textContent = "Enter: Neues Spiel · Escape: Beenden";
    shipSelection.style.display = "none";
    volumeControl.style.display = "none";
    btnStart.disabled = false;
    btnStart.textContent = "Nochmal";
    btnStop.disabled = false;
}

function checkGameState() {
    if (!game) return;

    if (game.state === "gameover") {
        setGameOver();
        return;
    }

    requestAnimationFrame(checkGameState);
}

function startGame() {
    if (game) return;

    game = HuntWikeloGame.mount(
        canvas, 
        { basePath: "./assets", 
            initialShipSkinIndex: selectedShipIndex,
            sfxVolume: selectedVolume,
            musicVolume: selectedVolume
        });
    game.music?.play?.();

    queueMicrotask(() => canvas.focus({ preventScroll: true }));

    setRunning(true);

    requestAnimationFrame(checkGameState);
}

function stopGame() {
    if (!game) return;

    game.destroy();
    game = null;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setRunning(false);
}

btnStart.addEventListener("click", () => {
    if (!game) {
        startGame();
    }
    else if (game.state === "paused") {
        game.resume();
        setRunning(true);
    }
    else if (game.state === "gameover") {
        game.destroy();
        game = null;
        startGame();
    }
});

btnStop.addEventListener("click", stopGame);

btnFullscreen.addEventListener("click", async () => {
    try {
        if (!document.fullscreenElement) {
            const stage = document.querySelector(".stage");
            await stage.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (_) {
        // ignore
    }
});

// Enter startet, Escape stoppt (Standalone komfortabel)
window.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        if (!game) {
            startGame();
        }
        else if (game.state === "running") {
            game.pause();
            setPaused();
        }
        else if (game.state === "paused") {
            game.resume();
            setRunning(true);
        }
        else if (game.state == "gameover") {
            game.destroy();
            game = null;
            startGame();
        }
    }

    if (e.key === "Escape") {
        if (game?.state === "running") {
            game.pause();
            setPaused();
        }
        else if (game?.state === "paused") {
            stopGame();
        }
        else if (game?.state === "gameover") {
            stopGame();
        }
    }
});

window.addEventListener("beforeunload", stopGame);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopGame();
});
