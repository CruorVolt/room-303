function MessageSource() {

    this.listeners = [];

    this.addListener = (handler) => {
        this.listeners.push(handler);
    }

    this.messageInterval = setInterval(() => {
        this.listeners.forEach((handler) => {
            handler("HELLO");
        })
    }, 100);
}

export { MessageSource }