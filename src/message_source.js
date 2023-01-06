function MessageSource() {

    const connect = () => {

        console.log('conenct');
        this.connection = new WebSocket(('ws://localhost:8080'));

        // Listen for messages
        this.connection.addEventListener('message', (event) => {
            this.listeners.forEach((handler) => {
                handler(event.data);
            })
        });

        this.connection.onerror = (err) => {
            console.log(err);
            this.connection.close();
        }

        this.connection.onclose = () => {
            console.log('onclose');
            this.connection = null;
            setTimeout( connect, 500 );
        }

    }

    connect();

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