function MessageSource() {

    this.connection = new WebSocket('ws://localhost:8080');

    // Listen for messages
    this.connection.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
        this.listeners.forEach((handler) => {
            handler(event.data);
        })
    });

    this.listeners = [];

    this.addListener = (handler) => {
        this.listeners.push(handler);
    }

    this.close = () => {
        this.listeners = [];
        clearInterval(this.messageInterval); 
        this.connection.close();
        console.log("CLOSED");
    }

}

export { MessageSource }