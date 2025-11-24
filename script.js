document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reminderForm');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const chips = document.querySelectorAll('.chip');
    const hiddenIntervalInput = document.getElementById('interval');
    const statusMessage = document.getElementById('statusMessage');

    let reminderIntervalId = null;

    // Chip Selection Logic
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            hiddenIntervalInput.value = chip.dataset.value;
        });
    });

    // Request Notification Permission
    function requestNotificationPermission() {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return false;
        }

        if (Notification.permission === "granted") {
            return true;
        }

        if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    new Notification("HydrateMe By Sam", {
                        body: "Awesome! We'll remind you to drink water.",
                        icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png"
                    });
                    return true;
                }
            });
        }
        return false;
    }

    // Load User Data
    function loadUserData() {
        const savedName = localStorage.getItem('hydrate_name');
        const savedInterval = localStorage.getItem('hydrate_interval');

        if (savedName) {
            document.getElementById('name').value = savedName;
        }
        if (savedInterval) {
            hiddenIntervalInput.value = savedInterval;
            chips.forEach(c => {
                if (c.dataset.value === savedInterval) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });
        }
    }

    loadUserData();

    // Get catchy message
    function getReminderMessage(name) {
        const messages = [
            `Hey ${name}, stay sharp! Time for some water. 💧`,
            `Hydrate like a boss, ${name}! 🥤`,
            `Fuel up, ${name}. Your body needs water! 💪`,
            `Don't let dehydration beat you, ${name}. Drink up!`,
            `Level up your energy, ${name}. Take a sip!`,
            `Hey ${name}, glow time! Drink some water. ✨`,
            `Stay beautiful and hydrated, ${name}! 💧`,
            `Self-care alert, ${name}! Time for a glass of water. 🌸`,
            `Keep that skin glowing, ${name}. Drink up! 🥤`,
            `Refresh yourself, ${name}. You deserve a break!`,
            `Water break! Keep going, ${name}. ✨`,
            `Your body will thank you, ${name}. Drink up!`
        ];
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }

    // Worker Initialization
    let timerWorker = null;
    if (window.Worker) {
        try {
            timerWorker = new Worker('timer.worker.js');
            timerWorker.onmessage = function (e) {
                if (e.data === 'TICK') {
                    triggerNotification();
                }
            };
            timerWorker.onerror = function (e) {
                console.warn("Worker error:", e);
                timerWorker = null; // Fallback to main thread
            };
        } catch (err) {
            console.warn("Could not create Web Worker (likely file:// protocol restriction). Falling back to main thread.", err);
            timerWorker = null;
        }
    } else {
        console.warn("Web Workers not supported. Falling back to main thread.");
    }

    function triggerNotification() {
        const name = document.getElementById('name').value;
        const message = getReminderMessage(name);

        new Notification("HydrateMe By Sam", {
            body: message,
            icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png",
            requireInteraction: true,
            tag: 'hydration-reminder'
        });
    }

    function startReminders() {
        const name = document.getElementById('name').value;
        const intervalMinutes = parseInt(hiddenIntervalInput.value);

        localStorage.setItem('hydrate_name', name);
        localStorage.setItem('hydrate_interval', intervalMinutes);

        // UI Updates
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        statusMessage.classList.remove('hidden');

        document.getElementById('name').disabled = true;
        chips.forEach(c => c.style.pointerEvents = 'none');

        new Notification("HydrateMe Started", {
            body: `We'll remind you every ${intervalMinutes} minute${intervalMinutes > 1 ? 's' : ''}.`,
            icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png"
        });

        const intervalMs = intervalMinutes * 60 * 1000;
        console.log(`Starting reminder for ${intervalMinutes} minutes (${intervalMs}ms)`);

        if (timerWorker) {
            timerWorker.postMessage({ command: 'START', interval: intervalMs });
        } else {
            if (reminderIntervalId) clearInterval(reminderIntervalId);
            reminderIntervalId = setInterval(triggerNotification, intervalMs);
        }
    }

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    startReminders();
                } else {
                    alert("We need notification permissions to remind you!");
                }
            });
        } else {
            startReminders();
        }
    });

    // Stop Reminders
    stopBtn.addEventListener('click', () => {
        if (timerWorker) {
            timerWorker.postMessage({ command: 'STOP' });
        }
        if (reminderIntervalId) {
            clearInterval(reminderIntervalId);
            reminderIntervalId = null;
        }

        startBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
        statusMessage.classList.add('hidden');

        document.getElementById('name').disabled = false;
        chips.forEach(c => c.style.pointerEvents = 'auto');
    });
});
