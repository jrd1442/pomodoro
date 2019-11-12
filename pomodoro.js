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
        }

        this.alarm = this.msecs <= 0;
        this.notify();
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

        document.title = pom.alarm ? "Bzzzz!" : "Bambi's Pomodoro Timer";
    }

};

let pom = new Pomodoro(60000);
new PomodoroHandler(pomHandler, pom);
new PomodoroView(pomView, pom);