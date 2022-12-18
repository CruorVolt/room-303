function MessageSource() {

    this.listeners = [];
    this.messageInterval = null;

    this.addListener = (handler) => {
        this.listeners.push(handler);
    }

    this.close = () => {
        this.listeners = [];
        clearInterval(this.messageInterval); 
    }

    this.messageInterval = setInterval(() => {
        this.listeners.forEach((handler) => {
            handler(String(Math.random()));
        })
    }, 100);
}

export { MessageSource }