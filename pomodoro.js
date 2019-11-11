class Pomodoro {
    constructor(secs) {
        this.total_secs = secs;
        this.secs = secs;
        this.alarm = false;
        this.updateView();
    }

    updateView() {
        // split the view logic out?
        document.getElementById("pom").innerHTML = this.secs;

        document.title = this.alarm ? "Bzzzz!" : "Bambi's Pomodoro Timer";
    }

    tick() {
        let prev_tick = this.last_tick;
        this.last_tick = new Date();

        if (this.secs > 0) {
            this.secs -= Math.trunc((this.last_tick - prev_tick)/1000);
        }

        this.alarm = this.secs == 0;
        this.updateView();

    }

    resume() {
        this.interval = setInterval(this.tick.bind(this), 1000);
        this.last_tick = new Date();
    }

    pause() {
        clearInterval(this.interval);
    }

    reset() {
        this.secs = this.total_secs;
        this.alarm = false;
        this.updateView();
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

new PomodoroHandler(pomHandler,  new Pomodoro(60));