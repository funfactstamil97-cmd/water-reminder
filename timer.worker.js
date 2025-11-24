self.onmessage = function (e) {
    const { command, interval } = e.data;

    if (command === 'START') {
        if (self.timerId) clearInterval(self.timerId);

        console.log(`Worker: Starting timer for ${interval}ms`);
        self.timerId = setInterval(() => {
            self.postMessage('TICK');
        }, interval);
    }
    else if (command === 'STOP') {
        if (self.timerId) {
            clearInterval(self.timerId);
            self.timerId = null;
            console.log('Worker: Timer stopped');
        }
    }
};
