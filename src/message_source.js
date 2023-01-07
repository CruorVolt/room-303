import { io } from 'socket.io-client';

function MessageSource() {

    const connect = () => {

        this.connection = io( 'http://' + window.location.hostname + ':8080', {transports: ['polling']});

        // Listen for messages
        this.connection.on('message', (message) => {
            this.listeners.forEach((handler) => {
                handler(message);
            })
        });

        this.connection.on('connection_error', (err) => {
            console.log(err);
            this.connection.disconnect();
        });

        this.connection.on('disconnect', () => {
            this.connection = null;
            setTimeout( connect, 500 );
        });

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
    }

}

export { MessageSource }