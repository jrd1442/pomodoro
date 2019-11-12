function toMMSS(msecs) {
    let m = Math.trunc(msecs / 60000) % 60;
    let s = Math.trunc(msecs / 1000) % 60;

    return m.toString().padStart(2, '0') + ':' +
        s.toString().padStart(2, '0');
}

class Pomodoro {
    constructor(msecs) {
        this.total_msecs = msecs;
        this.msecs = msecs;
        this.alarm = false;
        this.interval = null;
        this.observers = [];
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    notify() {
        for (let observer of this.observers) {
            observer(this);
        }
    }

    tick() {
        let prev_tick = this.last_tick;
        this.last_tick = new Date();

        if (this.msecs > 0) {
            this.msecs -= Math.trunc(this.last_tick - prev_tick);
            this.alarm = this.msecs <= 0;
            this.notify();
        }
    }

    resume() {
        if (this.interval == null) {
            this.interval = setInterval(this.tick.bind(this), 125);
            this.last_tick = new Date();
        }
    }

    pause() {
        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        this.pause();
        // possible race condition? is a scheduled tick going to run?
        this.msecs = this.total_msecs;
        this.alarm = false;
        this.notify();
    }
};

class PomodoroHandler {
    constructor(elem, pom) {
        this._elem = elem;
        this.pom = pom;
        elem.onclick = this.onclick.bind(this);
    }

    start() {
        this.pom.resume();
    }

    stop() {
        this.pom.pause();
    }

    reset() {
        this.pom.reset();
    }

    onclick(event) {
        let action = event.target.dataset.action;
        if (action) {
            this[action]();
        }
    }
};

class PomodoroView {
    constructor(elem, pom) {
        this._elem = elem;
        pom.subscribe(this.updateView.bind(this));
        this.updateView(pom);
    }

    updateView(pom) {
        this._elem.innerHTML = toMMSS(pom.msecs);
    }

};

let pom = new Pomodoro(6000);
new PomodoroHandler(pomHandler, pom);
new PomodoroView(pomView, pom);

let titleListener = p => document.title = p.alarm ? "Bzzzz!" : "Bambi's Pomodoro Timer";
pom.subscribe(titleListener);

// clearly not mine
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.setAttribute("loop", "loop");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}

class AlarmListener {
    constructor(pom) {
        this.alarmSound = new sound("beep-07.wav");
        this.playing = false;
        pom.subscribe(this.onAlarm.bind(this));
        this.onAlarm(pom);
    }

    onAlarm(pom) {
        if (!this.playing && pom.alarm) {
            this.playing = true;
            this.alarmSound.play();
        } else if (this.playing && !pom.alarm) {
            this.alarmSound.stop();
            this.playing = false;
        }
    }
};

new AlarmListener(pom);