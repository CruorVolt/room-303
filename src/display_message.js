export default class DisplayMessage {

    constructor(message, row, key) {

        this.text = message + "   ";
        this.currentIdx = 0;

        this.row = row;
        this.key = key;

    }

    current() {
        return this.text[this.currentIdx % this.text.length];
    }

    next() {
        this.currentIdx = (this.currentIdx + 1);
        return this.current();
    }

    getIdx() {
        return this.currentIdx;
    }

}