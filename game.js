// /huntwikelo/game.js
// Game-Core (standalone + embedfähig)
// - Skins: shipSkins[], roidSkins[]

import {
    SHIP_CUTLASS_PATHS,
    SHIP_CUTLASS_THRUSTERS,
    SHIP_CUTLASS_COLLISIONS,

    SHIP_HULLC_PATHS,
    SHIP_HULLC_THRUSTERS,
    SHIP_HULLC_COLLISIONS,

    WIKELO_PATHS,
    WIKELO_COLLISION,

    WIKELO_A1_PATHS,
    WIKELO_A1_COLLISION,
    WIKELO_A1_T1_PATHS,
    WIKELO_A1_T1_COLLISION,
    WIKELO_A1_T2_PATHS,
    WIKELO_A1_T2_COLLISION,

    WIKELO_A2_PATHS,
    WIKELO_A2_COLLISION,
    WIKELO_A2_T1_PATHS,
    WIKELO_A2_T1_COLLISION,
    WIKELO_A2_T2_PATHS,
    WIKELO_A2_T2_COLLISION,

    WIKELO_B1_PATHS,
    WIKELO_B1_COLLISION,
    WIKELO_B1_T1_PATHS,
    WIKELO_B1_T1_COLLISION,
    WIKELO_B1_T2_PATHS,
    WIKELO_B1_T2_COLLISION,

    WIKELO_B2_PATHS,
    WIKELO_B2_COLLISION,
    WIKELO_B2_T1_PATHS,
    WIKELO_B2_T1_COLLISION,
    WIKELO_B2_T2_PATHS,
    WIKELO_B2_T2_COLLISION,

    WIKELO_C1_PATHS,
    WIKELO_C1_COLLISION,
    WIKELO_C1_T1_PATHS,
    WIKELO_C1_T1_COLLISION,
    WIKELO_C1_T2_PATHS,
    WIKELO_C1_T2_COLLISION,

    WIKELO_C2_PATHS,
    WIKELO_C2_COLLISION,
    WIKELO_C2_T1_PATHS,
    WIKELO_C2_T1_COLLISION,
    WIKELO_C2_T2_PATHS,
    WIKELO_C2_T2_COLLISION
} from "./shapes.js";

const WIKELO_SHAPES = {
    whole: WIKELO_PATHS,

    A1: WIKELO_A1_PATHS,
    A1_T1: WIKELO_A1_T1_PATHS,
    A1_T2: WIKELO_A1_T2_PATHS,
    A2: WIKELO_A2_PATHS,
    A2_T1: WIKELO_A2_T1_PATHS,
    A2_T2: WIKELO_A2_T2_PATHS,

    B1: WIKELO_B1_PATHS,
    B1_T1: WIKELO_B1_T1_PATHS,
    B1_T2: WIKELO_B1_T2_PATHS,
    B2: WIKELO_B2_PATHS,
    B2_T1: WIKELO_B2_T1_PATHS,
    B2_T2: WIKELO_B2_T2_PATHS,

    C1: WIKELO_C1_PATHS,
    C1_T1: WIKELO_C1_T1_PATHS,
    C1_T2: WIKELO_C1_T2_PATHS,
    C2: WIKELO_C2_PATHS,
    C2_T1: WIKELO_C2_T1_PATHS,
    C2_T2: WIKELO_C2_T2_PATHS,
};

const WIKELO_COLLISIONS = {
    whole: WIKELO_COLLISION,

    A1: WIKELO_A1_COLLISION,
    A1_T1: WIKELO_A1_T1_COLLISION,
    A1_T2: WIKELO_A1_T2_COLLISION,

    A2: WIKELO_A2_COLLISION,
    A2_T1: WIKELO_A2_T1_COLLISION,
    A2_T2: WIKELO_A2_T2_COLLISION,

    B1: WIKELO_B1_COLLISION,
    B1_T1: WIKELO_B1_T1_COLLISION,
    B1_T2: WIKELO_B1_T2_COLLISION,

    B2: WIKELO_B2_COLLISION,
    B2_T1: WIKELO_B2_T1_COLLISION,
    B2_T2: WIKELO_B2_T2_COLLISION,

    C1: WIKELO_C1_COLLISION,
    C1_T1: WIKELO_C1_T1_COLLISION,
    C1_T2: WIKELO_C1_T2_COLLISION,

    C2: WIKELO_C2_COLLISION,
    C2_T1: WIKELO_C2_T1_COLLISION,
    C2_T2: WIKELO_C2_T2_COLLISION,
};

const WIKELO_FIRST_SPLITS = [
    ["A1", "A2"],
    ["B1", "B2"],
    ["C1", "C2"],
];

const WIKELO_SECOND_SPLITS = {
    A1: ["A1_T1", "A1_T2"],
    A2: ["A2_T1", "A2_T2"],

    B1: ["B1_T1", "B1_T2"],
    B2: ["B2_T1", "B2_T2"],

    C1: ["C1_T1", "C1_T2"],
    C2: ["C2_T1", "C2_T2"],
};

const AUDIO_CONFIG = {
    music: {
        track: "sounds/SC_FirstLight_Bridge_Loop_Single.mp3",
        baseVol: 0.25,
    },
    sfx: {
        explode: { file: "sounds/explode.mp3", streams: 1, baseVol: 0.80 },
        hit:     { file: "sounds/hit.mp3",     streams: 5, baseVol: 0.80 },
        laser:   { file: "sounds/laser.mp3",   streams: 5, baseVol: 0.55 },
        thrust:  { file: "sounds/thrust.mp3",  streams: 1, baseVol: 0.35 },
    }
};

class Sound {
    constructor(src, maxStreams = 1, baseVol = 1.0, core) {
        this.core = core;
        this.baseVol = baseVol;
        this.streamNum = 0;
        this.streams = [];        
        this.maxStreams = Math.max(1, maxStreams | 0);
        
        for (let i = 0; i < maxStreams; i++) {
            const a = new Audio(src);
            a.volume = 0;
            this.streams.push(a);
        }
    }

    play() {
        if (!this.core.SOUND_ON || !this.core.SFX_ACTIVE) return;

        this.streamNum = (this.streamNum +1) % this.maxStreams;

        const a = this.streams[this.streamNum];
        a.volume = this.baseVol * (this.core.SFX_VOL ?? 1.0);
        a.play().catch(() => {});        
    }

    stop() {
        const a = this.streams[this.streamNum];
        a.pause();
        a.currentTime = 0;
    }
}

class Music {
    constructor(src, baseVol = 1.0, core) {
        this.core = core;
        this.baseVol = baseVol;
        this.audio = new Audio(src);
        this.audio.loop = true;
        this.audio.preload = "auto";
        this._applyVolume();
    }

    _applyVolume() {
        this.audio.volume = this.baseVol * (this.core.MUSIC_VOL ?? 1.0);
    }

    play() {
        if (!this.core.MUSIC_ON) return;

        this._applyVolume();
        this.audio.play().catch(() => {});
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
    
    pause() {
        this.audio.pause();
    }

    resume() {
        this.play();
    }
    
    setEnabled(on) {
        this.core.MUSIC_ON = !!on;
        if (this.core.MUSIC_ON) this.play();
        else this.pause();
    }
}

class HuntWikeloCore {
    constructor(canvas, options = {}) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("HuntWikeloCore erwartet ein HTMLCanvasElement.");
        }

        this.canv = canvas;

        // embed-safe Input
        this.canv.tabIndex = 0;
        this.canv.style.outline = "none";
        this._onPointerDown = () => this.canv.focus({ preventScroll: true });
        this.canv.addEventListener("pointerdown", this._onPointerDown);
        this.canv.style.cursor = "crosshair";

        this.ctx = canvas.getContext("2d");

        // -------- Options --------
        const {
            basePath = "./assets",
            fps = 60,
            audio = null,
            soundOn = true,
            musicOn = true,
            sfxVolume = 0.5,
            musicVolume = 0.5,

            showBounding = false,
            showCenterDot = false,

            // Skins: Array von Renderer-Objekten
            shipSkins = null,
            roidSkins = null,

            // Wählbare UI Skins 
            initialShipSkinIndex = 0,
            initialRoidSkinIndex = 0,
        } = options;

        this.basePath = String(basePath).replace(/\/$/, "");
        this.FPS = fps;

        this._rafId = null;
        this._running = true;
        this.state = "running";
        this._acc = 0;
        this._lastTs = 0;
        this._step = 1 / this.FPS;

        this.AUDIO = {
            ...AUDIO_CONFIG,
            ...(audio ?? {}),
            sfx: { ...AUDIO_CONFIG.sfx, ...(audio?.sfx ?? {}) },
            music: { ...AUDIO_CONFIG.music, ...(audio?.music ?? {}) },
        };
        this.SOUND_ON = !!soundOn;
        this.MUSIC_ON = !!musicOn;
        this.SFX_ACTIVE = true;
        this.SHOW_BOUNDING = !!showBounding;
        this.SHOW_CENTER_DOT = !!showCenterDot;

        this.SFX_VOL = Math.max(0, Math.min(1, sfxVolume));
        this.MUSIC_VOL = Math.max(0, Math.min(1, musicVolume));

        // -------- Constants --------
        this.GAME_LIVES = 3;
        this.SAVE_KEY_SCORE = "highscore";

        this.SHIP_SIZE = 30;
        this.SHIP_THRUST = 5;
        this.SHIP_EXPLODE_DUR = 0.3;
        this.SHIP_BLINK_DUR = 0.1;
        this.SHIP_INV_DUR = 3;

        this.WIKELO_SCALE_WHOLE = 1.0;
        this.WIKELO_SCALE_PART = 1.0;
        this.WIKELO_SCALE_SMALL = 1.25;

        this.FRICTION = 0.7;
        this.TURN_SPEED = 360;

        this.LASER_MAX = 10;
        this.LASER_SPD = 500;
        this.LASER_DIST = 0.6;
        this.LASER_EXPLODE_DUR = 0.1;

        this.ROIDS_NUM = 3;
        this.ROIDS_SIZE = 100;
        this.ROIDS_SPD = 100;
        this.ROIDS_VERT = 10;
        this.ROIDS_JAG = 0.4;

        this.ROIDS_PTS_LGE = 20;
        this.ROIDS_PTS_MED = 50;
        this.ROIDS_PTS_SML = 100;

        this.TEXT_FADE_TIME = 2.5;
        this.TEXT_SIZE = 40;

        // -------- Skins --------

        this.shipSkins = Array.isArray(shipSkins) && shipSkins.length ? shipSkins : this._defaultShipSkins();
        this.roidSkins = Array.isArray(roidSkins) && roidSkins.length ? roidSkins : this._defaultRoidSkins();

        this.shipSkinIndex = this._clampIndex(initialShipSkinIndex, this.shipSkins.length);
        this.roidSkinIndex = this._clampIndex(initialRoidSkinIndex, this.roidSkins.length);

        // -------- State --------
        this.level = 0;
        this.lives = 0;
        this.roids = [];
        this.score = 0;
        this.scoreHigh = 0;
        this.ship = null;
        this.text = "";
        this.textAlpha = 0;

        this.roidsLeft = 0;
        this.roidsTotal = 0;

        // -------- Audio --------

        const sfx = this.AUDIO.sfx;
        this.fxExplode = new Sound(`${this.basePath}/${sfx.explode.file}`, sfx.explode.streams, sfx.explode.baseVol, this);
        this.fxHit     = new Sound(`${this.basePath}/${sfx.hit.file}`,     sfx.hit.streams, sfx.hit.baseVol, this);
        this.fxLaser   = new Sound(`${this.basePath}/${sfx.laser.file}`,   sfx.laser.streams, sfx.laser.baseVol, this);
        this.fxThrust  = new Sound(`${this.basePath}/${sfx.thrust.file}`,  sfx.thrust.streams, sfx.thrust.baseVol, this);

        const mus = this.AUDIO.music;
        this.music = new Music(`${this.basePath}/${mus.track}`, mus.baseVol, this);

        // -------- Input bindings --------
        this._onKeyDown = (ev) => this.keyDown(ev);
        this._onKeyUp = (ev) => this.keyUp(ev);

        // Start
        this.newGame();
        document.addEventListener("keydown", this._onKeyDown);
        document.addEventListener("keyup", this._onKeyUp);

        this._tick = (ts) => {
            if (!this._running) return;

            if (this.state === "paused" || this.state === "gameover") {
                this._lastTs = ts;
                this._rafId = requestAnimationFrame(this._tick);
                return;
            }

            if (!this._lastTs) {
                this._lastTs = ts;
                this._rafId = requestAnimationFrame(this._tick);
                return;
            }
                
            let dt = (ts - this._lastTs) / 1000;
            this._lastTs = ts;
            
            // clamp: Tab-Wechsel / Hänger
            if (dt > 0.25) dt = 0.25;

            this._acc += dt;

            // fixed update 60 Hz
            while (this._acc >= this._step) {
                this.update();
                this._acc -= this._step;
            }

            this._rafId = requestAnimationFrame(this._tick);
        };
        this._rafId = requestAnimationFrame(this._tick);
    }

    destroy() {
        // stop loop
        this._running = false;
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        
        // remove input
        document.removeEventListener("keydown", this._onKeyDown);
        document.removeEventListener("keyup", this._onKeyUp);

        // stop thrust audio
        if (this.fxThrust) this.fxThrust.stop();
        if (this.music) this.music.stop();

        // pointerdown cleanup
        if (this._onPointerDown) {
            this.canv.removeEventListener("pointerdown", this._onPointerDown);
            this._onPointerDown = null;
        }
    }

    pause() {
        if (this.state !== "running") return;

        this.state = "paused";
        // this.music.pause();
        this.setSfxActive(false);
    }

    resume() {
        if (this.state !== "paused") return;

        this.state = "running";
        // this.music.resume();
        this.setSfxActive(true);
    }

    setSfxActive(active) {
        this.SFX_ACTIVE = active;

        if (!active) {
            this.fxExplode.stop();
            this.fxHit.stop();
            this.fxLaser.stop();
            this.fxThrust.stop();
        }
    }

    // ---------------------------
    // Public skin controls (später für UI)
    // ---------------------------
    setShipSkin(index) {
        this.shipSkinIndex = this._clampIndex(index, this.shipSkins.length);
    }

    setRoidSkin(index) {
        this.roidSkinIndex = this._clampIndex(index, this.roidSkins.length);
        // Optional: existierende Asteroiden neu formen
        // this._rebuildExistingAsteroidsForSkin();
    }

    // ---------------------------
    // Core game functions
    // ---------------------------
    createAsteroidBelt() {
        this.roids = [];
        this.roidsTotal = (this.ROIDS_NUM + this.level) * 7;
        this.roidsLeft = this.roidsTotal;

        let x, y;
        for (let i = 0; i < this.ROIDS_NUM + this.level; i++) {
            do {
                x = Math.floor(Math.random() * this.canv.width);
                y = Math.floor(Math.random() * this.canv.height);
            } 
            while (this.distBetweenPoints(this.ship.x, this.ship.y, x, y) < this.ROIDS_SIZE * 2 + this.ship.r);

            this.roids.push(this.newAsteroid(x, y, Math.ceil(this.ROIDS_SIZE / 2)));
        }
    }

    spawnWikeloPair(parent, type1, type2, r) {
        const child1 = this.newAsteroid(parent.x, parent.y, r, type1);
        const child2 = this.newAsteroid(parent.x, parent.y, r, type2);
        const splitAngle = Math.random() * Math.PI * 2;
        const splitSpeed = 40 / this.FPS;
        child1.xv = parent.xv + Math.cos(splitAngle) * splitSpeed;
        child1.yv = parent.yv + Math.sin(splitAngle) * splitSpeed;
        child2.xv = parent.xv - Math.cos(splitAngle) * splitSpeed;
        child2.yv = parent.yv - Math.sin(splitAngle) * splitSpeed;
        this.roids.push(child1, child2);
    }

    destroyAsteroid(index) {
        const roid = this.roids[index];
        const type = roid.wikeloType;

        if (type === "whole") {
            const split = ["C1", "C2"];
            /* ORGINAL
            const split = WIKELO_FIRST_SPLITS[
                Math.floor(Math.random() * WIKELO_FIRST_SPLITS.length)
            ];
            */
            this.spawnWikeloPair(
                roid,
                split[0],
                split[1],
                Math.ceil(this.ROIDS_SIZE / 3)
            );

            this.score += this.ROIDS_PTS_LGE;
        }
        else if (WIKELO_SECOND_SPLITS[type]) {
            const split = WIKELO_SECOND_SPLITS[type];

            this.spawnWikeloPair(
                roid,
                split[0],
                split[1],
                Math.ceil(this.ROIDS_SIZE / 6)
            );

            this.score += this.ROIDS_PTS_MED;
        }
        else {
            this.score += this.ROIDS_PTS_SML;
        }

        if (this.score > this.scoreHigh) {
            this.scoreHigh = this.score;
            localStorage.setItem(this.SAVE_KEY_SCORE, String(this.scoreHigh));
        }

        this.roids.splice(index, 1);
        this.fxHit.play();

        this.roidsLeft--;

        if (this.roids.length === 0) {
            this.level++;
            this.newLevel();
        }
    }

    distBetweenPoints(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    isPointInsideWikeloCollision(px, py, roid) {
        const collisionShapes = roid.collisionShapes ?? [];

        const scale = roid.r * roid.wikeloScale;

        const cosRoid = Math.cos(roid.a);
        const sinRoid = Math.sin(roid.a);

        for (const shape of collisionShapes) {

            // Mittelpunkt der Ellipse im Welt-Raum
            const centerX = shape.x * scale;
            const centerY = shape.y * scale;

            const worldX =
                roid.x
                + centerX * cosRoid
                + centerY * sinRoid;

            const worldY =
                roid.y
                - centerX * sinRoid
                + centerY * cosRoid;

            const radiusX = shape.radiusX * scale;
            const radiusY = shape.radiusY * scale;

            // Gesamtdrehung der Ellipse
            const angle =
                -roid.a + (shape.angle ?? 0);

            // Punkt relativ zum Ellipsenmittelpunkt
            const dx = px - worldX;
            const dy = py - worldY;

            // Punkt in lokalen Raum der Ellipse drehen
            const cos = Math.cos(-angle);
            const sin = Math.sin(-angle);

            const localX =
                dx * cos - dy * sin;

            const localY =
                dx * sin + dy * cos;

            // Standard-Ellipsenprüfung
            const value =
                (localX * localX) / (radiusX * radiusX) +
                (localY * localY) / (radiusY * radiusY);

            if (value <= 1) {
                return true;
            }
        }
        return false;
    }

    ellipseToPolygon(centerX, centerY, radiusX, radiusY, angle, segments = 12) {
        const points = [];

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        for (let i = 0; i < segments; i++) {
            const t = i / segments * Math.PI * 2;

            const localX = Math.cos(t) * radiusX;
            const localY = Math.sin(t) * radiusY;

            points.push({
                x: centerX + localX * cosA - localY * sinA,
                y: centerY + localX * sinA + localY * cosA,
            });
        }

        return points;
    }

    polygonsOverlapSAT(polyA, polyB) {
        const polygons = [polyA, polyB];

        for (const polygon of polygons) {
            for (let i = 0; i < polygon.length; i++) {
                const p1 = polygon[i];
                const p2 = polygon[(i + 1) % polygon.length];

                const edgeX = p2.x - p1.x;
                const edgeY = p2.y - p1.y;

                const axisX = -edgeY;
                const axisY = edgeX;

                let minA = Infinity;
                let maxA = -Infinity;

                for (const p of polyA) {
                    const projection = p.x * axisX + p.y * axisY;

                    if (projection < minA) minA = projection;
                    if (projection > maxA) maxA = projection;
                }

                let minB = Infinity;
                let maxB = -Infinity;

                for (const p of polyB) {
                    const projection = p.x * axisX + p.y * axisY;

                    if (projection < minB) minB = projection;
                    if (projection > maxB) maxB = projection;
                }

                if (maxA < minB || maxB < minA) {
                    return false;
                }
            }
        }
        return true;
    }

    isShipCollidingWithAsteroid(roid) {
        const shipSkin = this.shipSkins[this.shipSkinIndex];

        const shipCollisionShapes =
            shipSkin.collisionShapes ?? [];

        const roidCollisionShapes =
            roid.collisionShapes ?? [];

        const shipScale =
            this.ship.r * (shipSkin.scale ?? 1.0);

        const roidScale =
            roid.r * roid.wikeloScale;


        // ------------------------------------------
        // Alle Ship-Ellipsen
        // ------------------------------------------

        for (const shipShape of shipCollisionShapes) {

            const shipLocalX =
                shipShape.x * shipScale;

            const shipLocalY =
                shipShape.y * shipScale;

            const shipCos = Math.cos(this.ship.a);
            const shipSin = Math.sin(this.ship.a);

            const shipWorldX =
                this.ship.x
                + shipLocalX * shipCos
                + shipLocalY * shipSin;

            const shipWorldY =
                this.ship.y
                - shipLocalX * shipSin
                + shipLocalY * shipCos;

            const shipRadiusX =
                shipShape.radiusX * shipScale;

            const shipRadiusY =
                shipShape.radiusY * shipScale;

            const shipAngle =
                -this.ship.a
                + (shipShape.angle ?? 0);


            // --------------------------------------
            // Gegen alle Wikelo-Ellipsen
            // --------------------------------------

            for (const roidShape of roidCollisionShapes) {

                const roidLocalX =
                    roidShape.x * roidScale;

                const roidLocalY =
                    roidShape.y * roidScale;

                const roidCos = Math.cos(roid.a);
                const roidSin = Math.sin(roid.a);

                const roidWorldX =
                    roid.x
                    + roidLocalX * roidCos
                    + roidLocalY * roidSin;

                const roidWorldY =
                    roid.y
                    - roidLocalX * roidSin
                    + roidLocalY * roidCos;

                const roidRadiusX =
                    roidShape.radiusX * roidScale;

                const roidRadiusY =
                    roidShape.radiusY * roidScale;

                const roidAngle =
                    -roid.a
                    + (roidShape.angle ?? 0);


                // ----------------------------------
                // Schneller Vorabtest
                // ----------------------------------

                const dx =
                    roidWorldX - shipWorldX;

                const dy =
                    roidWorldY - shipWorldY;

                const shipMaxRadius =
                    Math.max(shipRadiusX, shipRadiusY);

                const roidMaxRadius =
                    Math.max(roidRadiusX, roidRadiusY);

                const maxDistance =
                    shipMaxRadius + roidMaxRadius;

                if (
                    dx * dx + dy * dy >
                    maxDistance * maxDistance
                ) {
                    continue;
                }


                // ----------------------------------
                // Ellipsen als konvexe Polygone
                // ----------------------------------

                const shipPoly =
                    this.ellipseToPolygon(
                        shipWorldX,
                        shipWorldY,
                        shipRadiusX,
                        shipRadiusY,
                        shipAngle
                    );

                const roidPoly =
                    this.ellipseToPolygon(
                        roidWorldX,
                        roidWorldY,
                        roidRadiusX,
                        roidRadiusY,
                        roidAngle
                    );


                // ----------------------------------
                // SAT Collision
                // ----------------------------------

                if (
                    this.polygonsOverlapSAT(
                        shipPoly,
                        roidPoly
                    )
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    explodeShip() {
        this.ship.explodeTime = Math.ceil(this.SHIP_EXPLODE_DUR * this.FPS);
        this.fxExplode.play();
    }

    gameOver() {
        this.ship.dead = true;
        this.state = "gameover";

        // this.music.pause();
        this.setSfxActive(false);

        this.text = "Game Over";
        this.textAlpha = 1.0;
    }

    keyDown(ev) {
        if (document.activeElement !== this.canv) return;
        if (this.state !== "running") return;

        // blocke Browser-Defaults (Space scrollt, Pfeile scrollen, etc.)
        const block = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(ev.code)
                   || ["w","a","d","W","A","D"].includes(ev.key);

        if (block) ev.preventDefault();

        if (this.ship.dead) return;

        switch (ev.code) {
            case "Space":
                this.shootLaser();
                break;
            case "KeyA":
            case "ArrowLeft":
                this.ship.rot = this.TURN_SPEED / 180 * Math.PI / this.FPS;
                break;
            case "KeyW":
            case "ArrowUp":
                this.ship.thrusting = true;
                break;
            case "KeyD":
            case "ArrowRight":
                this.ship.rot = -this.TURN_SPEED / 180 * Math.PI / this.FPS;
            break;
        }
    }

    keyUp(ev) {
        if (document.activeElement !== this.canv) return;
        if (this.state !== "running") return;

        const block = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(ev.code)
                   || ["w","a","d","W","A","D"].includes(ev.key);
        if (block) ev.preventDefault();

        if (this.ship.dead) return;

        switch (ev.code) {
            case "Space":
                this.ship.canShoot = true;
                break;
            case "KeyA":
            case "ArrowLeft":
            case "KeyD":
            case "ArrowRight":
                this.ship.rot = 0;
                break;
            case "KeyW":
            case "ArrowUp":
                this.ship.thrusting = false;
                break;
        }
    }

    newAsteroid(x, y, r, wikeloType = "whole") {
        let wikeloScale = this.WIKELO_SCALE_WHOLE;
        
        if (wikeloType.includes("_T")) {
            wikeloScale = this.WIKELO_SCALE_SMALL;
        }
        else if (wikeloType !== "whole") {
            wikeloScale = this.WIKELO_SCALE_PART;
        }

        const lvlMult = 1 + 0.1 * this.level;

        // Skin-spezifische Geometrie-Daten (Default: jagged polygon)
        const skin = this.roidSkins[this.roidSkinIndex];
        const geom = skin.makeGeom ? skin.makeGeom(this, r) : this._makeDefaultRoidGeom(r);

        return {
            x,
            y,
            xv: Math.random() * this.ROIDS_SPD * lvlMult / this.FPS * (Math.random() < 0.5 ? 1 : -1),
            yv: Math.random() * this.ROIDS_SPD * lvlMult / this.FPS * (Math.random() < 0.5 ? 1 : -1),
            r,
            a: Math.random() * Math.PI * 2,
            wikeloType,
            wikeloScale,
            paths: WIKELO_SHAPES[wikeloType] ?? WIKELO_PATHS,
            collisionShapes: WIKELO_COLLISIONS[wikeloType] ?? WIKELO_COLLISION,
            ...geom,
        };
    }

    newGame() {
        this.level = 0;
        this.lives = this.GAME_LIVES;
        this.score = 0;
        this.ship = this.newShip();

        const scoreStr = localStorage.getItem(this.SAVE_KEY_SCORE);
        this.scoreHigh = scoreStr == null ? 0 : parseInt(scoreStr, 10);

        this.newLevel();
    }

    newLevel() {
        // Level-Text
        this.text = "Level " + (this.level + 1);
        this.textAlpha = 1.0;

        this.createAsteroidBelt();
    }

    newShip() {
        return {
            x: this.canv.width / 2,
            y: this.canv.height / 2,
            r: this.SHIP_SIZE / 2,
            a: 90 / 180 * Math.PI,
            blinkNum: Math.ceil(this.SHIP_INV_DUR / this.SHIP_BLINK_DUR),
            blinkTime: Math.ceil(this.SHIP_BLINK_DUR * this.FPS),
            canShoot: true,
            dead: false,
            explodeTime: 0,
            lasers: [],
            rot: 0,
            thrusting: false,
            thrust: { x: 0, y: 0 },
        };
    }

    shootLaser() {
        if (this.ship.canShoot && this.ship.lasers.length < this.LASER_MAX) {
            this.ship.lasers.push({
                x: this.ship.x + 4 / 3 * this.ship.r * Math.cos(this.ship.a),
                y: this.ship.y - 4 / 3 * this.ship.r * Math.sin(this.ship.a),
                xv: this.LASER_SPD * Math.cos(this.ship.a) / this.FPS,
                yv: -this.LASER_SPD * Math.sin(this.ship.a) / this.FPS,
                dist: 0,
                explodeTime: 0,
            });
            this.fxLaser.play();
        }
        this.ship.canShoot = false;
    }

    update() {
        const ctx = this.ctx;

        const blinkOn = this.ship.blinkNum % 2 === 0;
        const exploding = this.ship.explodeTime > 0;

        // clear
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canv.width, this.canv.height);

        // thrust
        if (this.ship.thrusting && !this.ship.dead) {
            this.ship.thrust.x += this.SHIP_THRUST * Math.cos(this.ship.a) / this.FPS;
            this.ship.thrust.y -= this.SHIP_THRUST * Math.sin(this.ship.a) / this.FPS;
            this.fxThrust.play();

            // thruster draw
            if (!exploding && blinkOn) {
                const shipSkin = this.shipSkins[this.shipSkinIndex];
                const thrusterPoints = shipSkin.thrusterPoints ?? [];

                const r = this.ship.r;
                const shipScale = shipSkin.scale ?? 2.0;
                const flameScale = 0.7;

                const transformPoint = (px, py) => ({
                    x: this.ship.x
                        + px * r * shipScale * Math.cos(this.ship.a)
                        + py * r * shipScale * Math.sin(this.ship.a),

                    y: this.ship.y
                        - px * r * shipScale * Math.sin(this.ship.a)
                        + py * r * shipScale * Math.cos(this.ship.a),
                });

                for (const [px, py] of thrusterPoints) {
                    const left = transformPoint(px, py - 0.08 * flameScale);
                    const right = transformPoint(px, py + 0.08 * flameScale);
                    const tip = transformPoint(px - 0.65 * flameScale, py);

                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = this.SHIP_SIZE / 30;

                    ctx.beginPath();
                    ctx.moveTo(left.x, left.y);
                    ctx.lineTo(tip.x, tip.y);
                    ctx.lineTo(right.x, right.y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }

        } else {
            this.ship.thrust.x -= this.FRICTION * this.ship.thrust.x / this.FPS;
            this.ship.thrust.y -= this.FRICTION * this.ship.thrust.y / this.FPS;
            this.fxThrust.stop();
        }

        // ship draw
        if (!exploding) {
            if (blinkOn && !this.ship.dead) {
                const shipSkin = this.shipSkins[this.shipSkinIndex];
                shipSkin.drawShip(this, this.ship.x, this.ship.y, this.ship.a, "white");
            }

            if (this.ship.blinkNum > 0) {
                this.ship.blinkTime--;
                if (this.ship.blinkTime === 0) {
                    this.ship.blinkTime = Math.ceil(this.SHIP_BLINK_DUR * this.FPS);
                    this.ship.blinkNum--;
                }
            }
        }
        else {
            // explosion
            ctx.fillStyle = "darkred";
            ctx.beginPath(); ctx.arc(this.ship.x, this.ship.y, this.ship.r * 1.7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "red";
            ctx.beginPath(); ctx.arc(this.ship.x, this.ship.y, this.ship.r * 1.4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "orange";
            ctx.beginPath(); ctx.arc(this.ship.x, this.ship.y, this.ship.r * 1.1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "yellow";
            ctx.beginPath(); ctx.arc(this.ship.x, this.ship.y, this.ship.r * 0.8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "white";
            ctx.beginPath(); ctx.arc(this.ship.x, this.ship.y, this.ship.r * 0.5, 0, Math.PI * 2); ctx.fill();
        }

        if (this.SHOW_BOUNDING) {
            const shipSkin = this.shipSkins[this.shipSkinIndex];
            const collisionShapes = shipSkin.collisionShapes ?? [];
            const shipScale = shipSkin.scale ?? 1.0;

            ctx.strokeStyle = "lime";
            ctx.lineWidth = 1;

            for (const shape of collisionShapes) {
                const centerX = shape.x * this.ship.r * shipScale;
                const centerY = shape.y * this.ship.r * shipScale;

                const radiusX = shape.radiusX * this.ship.r * shipScale;
                const radiusY = shape.radiusY * this.ship.r * shipScale;

                // lokalen Mittelpunkt mit dem Schiff mitdrehen
                const cos = Math.cos(this.ship.a);
                const sin = Math.sin(this.ship.a);

                const worldX = this.ship.x + centerX * cos + centerY * sin;

                const worldY = this.ship.y - centerX * sin + centerY * cos;

                ctx.beginPath();

                ctx.ellipse(
                    worldX,
                    worldY,
                    radiusX,
                    radiusY,
                    -this.ship.a + (shape.angle ?? 0),
                    0,
                    Math.PI * 2
                );

                ctx.stroke();
            }
        }

        // asteroids draw
        for (let i = 0; i < this.roids.length; i++) {
            const roidSkin = this.roidSkins[this.roidSkinIndex];
            roidSkin.drawRoid(this, this.roids[i]);
            if (this.SHOW_BOUNDING) {
                const roid = this.roids[i];
                const collisionShapes = roid.collisionShapes ?? [];

                ctx.strokeStyle = "lime";
                ctx.lineWidth = 1;

                const cos = Math.cos(roid.a);
                const sin = Math.sin(roid.a);

                for (const shape of collisionShapes) {
                    const centerX =
                        shape.x * roid.r * roid.wikeloScale;

                    const centerY =
                        shape.y * roid.r * roid.wikeloScale;

                    const radiusX =
                        shape.radiusX * roid.r * roid.wikeloScale;

                    const radiusY =
                        shape.radiusY * roid.r * roid.wikeloScale;

                    const worldX =
                        roid.x
                        + centerX * cos
                        + centerY * sin;

                    const worldY =
                        roid.y
                        - centerX * sin
                        + centerY * cos;

                    ctx.beginPath();

                    ctx.ellipse(
                        worldX,
                        worldY,
                        radiusX,
                        radiusY,
                        -roid.a + (shape.angle ?? 0),
                        0,
                        Math.PI * 2
                    );

                    ctx.stroke();
                }
            }
        }

        // center dot
        if (this.SHOW_CENTER_DOT) {
            ctx.fillStyle = "red";
            ctx.fillRect(this.ship.x - 1, this.ship.y - 1, 2, 2);
        }

        // lasers draw
        for (let i = 0; i < this.ship.lasers.length; i++) {
            const L = this.ship.lasers[i];
            if (L.explodeTime === 0) {
                ctx.fillStyle = "salmon";
                ctx.beginPath();
                ctx.arc(L.x, L.y, this.SHIP_SIZE / 15, 0, Math.PI * 2);
                ctx.fill();
            }
            else {
                ctx.fillStyle = "orangered";
                ctx.beginPath(); ctx.arc(L.x, L.y, this.SHIP_SIZE * 0.4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "salmon";
                ctx.beginPath(); ctx.arc(L.x, L.y, this.SHIP_SIZE * 0.25, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "pink";
                ctx.beginPath(); ctx.arc(L.x, L.y, this.SHIP_SIZE * 0.15, 0, Math.PI * 2); ctx.fill();
            }
        }

        // text
        if (this.textAlpha >= 0) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(255, 255, 255, " + this.textAlpha + ")";
            ctx.font = "small-caps " + this.TEXT_SIZE + "px monospace";
            ctx.fillText(this.text, this.canv.width / 2, this.canv.height * 0.75);
            this.textAlpha -= (1.0 / this.TEXT_FADE_TIME / this.FPS);
        }

        // lives
        for (let i = 0; i < this.lives; i++) {
            const lifeColour = exploding && i === this.lives - 1 ? "red" : "white";
            const shipSkin = this.shipSkins[this.shipSkinIndex];
            shipSkin.drawShip(this, this.SHIP_SIZE + i * this.SHIP_SIZE * 1.2, this.SHIP_SIZE, 0.5 * Math.PI, lifeColour, 1.2);
        }

        // score
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = this.TEXT_SIZE + "px monospace";
        ctx.fillText(this.score, this.canv.width / 2, this.SHIP_SIZE);
        
        // high score
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = (this.TEXT_SIZE * 0.6) + "px monospace";
        ctx.fillText("HIGH: " + this.scoreHigh, this.canv.width / 4, this.SHIP_SIZE);

        // laser hits on Wikelo
        for (let i = this.roids.length - 1; i >= 0; i--) {
            const roid = this.roids[i];

            for (let j = this.ship.lasers.length - 1; j >= 0; j--) {
                const laser = this.ship.lasers[j];

                if (
                    laser.explodeTime === 0 &&
                    this.isPointInsideWikeloCollision(
                        laser.x,
                        laser.y,
                        roid
                    )
                ) {
                    this.destroyAsteroid(i);

                    laser.explodeTime =
                        Math.ceil(
                            this.LASER_EXPLODE_DUR * this.FPS
                        );

                    break;
                }
            }
        }

        // ship vs asteroid
        if (!exploding) {
            if (this.ship.blinkNum === 0 && !this.ship.dead) {
                for (let i = 0; i < this.roids.length; i++) {
                    if (this.isShipCollidingWithAsteroid(this.roids[i])) {
                        this.explodeShip();
                        this.destroyAsteroid(i);
                        break;
                    }
                }
            }

            // rotate
            this.ship.a += this.ship.rot;

            // move ship
            this.ship.x += this.ship.thrust.x;
            this.ship.y += this.ship.thrust.y;

        }
        else {
            this.ship.explodeTime--;
            if (this.ship.explodeTime === 0) {
                this.lives--;
                if (this.lives === 0) this.gameOver();
                else this.ship = this.newShip();
            }
        }

        // wrap ship
        if (this.ship.x < 0 - this.ship.r) this.ship.x = this.canv.width + this.ship.r;
        else if (this.ship.x > this.canv.width + this.ship.r) this.ship.x = 0 - this.ship.r;
        
        if (this.ship.y < 0 - this.ship.r) this.ship.y = this.canv.height + this.ship.r;
        else if (this.ship.y > this.canv.height + this.ship.r) this.ship.y = 0 - this.ship.r;

        // move lasers
        for (let i = this.ship.lasers.length - 1; i >= 0; i--) {
            const L = this.ship.lasers[i];

            if (L.dist > this.LASER_DIST * this.canv.width) {
                this.ship.lasers.splice(i, 1);
                continue;
            }

            if (L.explodeTime > 0) {
                L.explodeTime--;
                if (L.explodeTime === 0) {
                    this.ship.lasers.splice(i, 1);
                    continue;
                }
            }
            else {
                L.x += L.xv;
                L.y += L.yv;
                L.dist += Math.sqrt(Math.pow(L.xv, 2) + Math.pow(L.yv, 2));
            }

            if (L.x < 0) L.x = this.canv.width;
            else if (L.x > this.canv.width) L.x = 0;

            if (L.y < 0) L.y = this.canv.height;
            else if (L.y > this.canv.height) L.y = 0;
        }

        // move asteroids
        for (let i = 0; i < this.roids.length; i++) {
            this.roids[i].x += this.roids[i].xv;
            this.roids[i].y += this.roids[i].yv;

            if (this.roids[i].x < 0 - this.roids[i].r) this.roids[i].x = this.canv.width + this.roids[i].r;
            else if (this.roids[i].x > this.canv.width + this.roids[i].r) this.roids[i].x = 0 - this.roids[i].r;

            if (this.roids[i].y < 0 - this.roids[i].r) this.roids[i].y = this.canv.height + this.roids[i].r;
            else if (this.roids[i].y > this.canv.height + this.roids[i].r) this.roids[i].y = 0 - this.roids[i].r;
        }
    }

    // ---------------------------
    // Default Skins
    // ---------------------------
    _defaultShipSkins() {
        const cutlass = {
            name: "cutlass",
            scale: 2.0,
            thrusterPoints: SHIP_CUTLASS_THRUSTERS,
            collisionShapes: SHIP_CUTLASS_COLLISIONS,
            drawShip(core, x, y, a, colour = "white", scale = null) {
                scale ??= this.scale;
                const ctx = core.ctx;
                const r = core.ship.r;
                const points = SHIP_CUTLASS_PATHS[0];

                const transformPoint = ([px, py]) => ({
                    x: x + px * r * scale * Math.cos(a) + py * r * scale * Math.sin(a),
                    y: y - px * r * scale * Math.sin(a) + py * r * scale * Math.cos(a),
                });

                ctx.strokeStyle = colour;
                ctx.lineWidth = core.SHIP_SIZE / 30;

                const first = transformPoint(points[0]);

                ctx.beginPath();
                ctx.moveTo(first.x, first.y);

                for (let i = 1; i < points.length; i++) {
                    const p = transformPoint(points[i]);
                    ctx.lineTo(p.x, p.y);
                }

                ctx.closePath();
                ctx.stroke();
            },
        };

        const hullC = {
            name: "hullC",
            scale: 2.7,
            thrusterPoints: SHIP_HULLC_THRUSTERS,
            collisionShapes: SHIP_HULLC_COLLISIONS,
            drawShip(core, x, y, a, colour = "white", scale = null) {
                scale ??= this.scale;
                const ctx = core.ctx;
                const r = core.ship.r;
                const points = SHIP_HULLC_PATHS[0];

                const transformPoint = ([px, py]) => ({
                    x: x + px * r * scale * Math.cos(a) + py * r * scale * Math.sin(a),
                    y: y - px * r * scale * Math.sin(a) + py * r * scale * Math.cos(a),
                });

                ctx.strokeStyle = colour;
                ctx.lineWidth = core.SHIP_SIZE / 30;

                const first = transformPoint(points[0]);

                ctx.beginPath();
                ctx.moveTo(first.x, first.y);

                for (let i = 1; i < points.length; i++) {
                    const p = transformPoint(points[i]);
                    ctx.lineTo(p.x, p.y);
                }

                ctx.closePath();
                ctx.stroke();
            },
        };

        return [cutlass, hullC];
    }

    _defaultRoidSkins() {
        const wikelo = {
            name: "wikelo",

            makeGeom: () => ({}),

            drawRoid: (core, roid) => {
                const ctx = core.ctx;
                const { x, y, r, a } = roid;

                const transformPoint = ([px, py]) => ({
                    x: x
                        + px * r * roid.wikeloScale * Math.cos(a)
                        + py * r * roid.wikeloScale * Math.sin(a),

                    y: y
                        - px * r * roid.wikeloScale * Math.sin(a)
                        + py * r * roid.wikeloScale * Math.cos(a),
                });

                ctx.strokeStyle = "slategrey";
                ctx.lineWidth = core.SHIP_SIZE / 20;

                for (const path of roid.paths) {
                    if (path.length === 0) continue;

                    const first = transformPoint(path[0]);

                    ctx.beginPath();
                    ctx.moveTo(first.x, first.y);

                    for (let i = 1; i < path.length; i++) {
                        const p = transformPoint(path[i]);
                        ctx.lineTo(p.x, p.y);
                    }

                    ctx.closePath();
                    ctx.stroke();
                }
            },
        };

        return [wikelo];
    }

    _makeDefaultRoidGeom() {
        const vert = Math.floor(Math.random() * (this.ROIDS_VERT + 1) + this.ROIDS_VERT / 2);
        const offs = [];
        for (let i = 0; i < vert; i++) {
            offs.push(Math.random() * this.ROIDS_JAG * 2 + 1 - this.ROIDS_JAG);
        }
        return { vert, offs };
    }

    _clampIndex(i, len) {
        if (!len) return 0;
        const n = Number.isFinite(i) ? Math.floor(i) : 0;
        return ((n % len) + len) % len;
    }
}

// Public API
export const HuntWikeloGame = {
    mount(target, options = {}) {
        const canvas = (typeof target === "string")
        ? document.querySelector(target)
        : target;

        return new HuntWikeloCore(canvas, options);
    }
};
