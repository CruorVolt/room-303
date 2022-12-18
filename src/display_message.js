export default class DisplayMessage {

    constructor(message) {
        this.text = message;
        this.currentIdx = 0;
    }

    current() {
        return this.text[this.currentIdx % this.text.length];
    }

    next() {
        this.currentIdx = (this.currentIdx + 1) % this.text.length;
        return this.current();
    }

    getIdx() {
        return this.currentIdx;
    }

}