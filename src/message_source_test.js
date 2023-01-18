function MessageSource() {

    this.listeners = [];
    this.messageInterval = null;

    this.addListener = (handler) => {
        this.listeners.push(handler);
    }

    this.close = () => {
        this.listeners = [];
        clearInterval(this.messageInterval); 
        console.log("CLOSED");
    }

     this.messageInterval = setInterval(() => {
        this.listeners.forEach((handler) => {
            let message = "";
            let length = Math.floor(Math.random() * 300);
            for (let i = 0; i <= length; i++ ) {
                let charCode = Math.floor(Math.random() * 25) + 65;
                message += String.fromCharCode(charCode);
            }
            handler(message);
        })
    }, 100);

}

export { MessageSource }