export default class DisplayMessage {

    constructor(message) {
        this.text = message + "   ";
        this.currentIdx = 0;
        this.offset = Math.floor(Math.random() * 5);
    }

    current() {
        return this.text[this.currentIdx % this.text.length];
    }

    next() {
        this.currentIdx = (this.currentIdx + 1);
        return this.current();
    }

    getIdx() {
        return this.currentIdx + this.offset;
    }

}