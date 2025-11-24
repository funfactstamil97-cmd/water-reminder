document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reminderForm');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const intervalInput = document.getElementById('interval');
    const intervalValue = document.getElementById('intervalValue');
    const statusMessage = document.getElementById('statusMessage');

    let reminderIntervalId = null;

    // Update slider value display
    intervalInput.addEventListener('input', (e) => {
        intervalValue.textContent = `${e.target.value} min`;
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
                    new Notification("HydrateMe", {
                        body: "Awesome! We'll remind you to drink water.",
                        icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png" // Generic water icon
                    });
                    return true;
                }
            });
        }
        return false;
    }

    // Load User Data from LocalStorage
    function loadUserData() {
        const savedName = localStorage.getItem('hydrate_name');
        const savedInterval = localStorage.getItem('hydrate_interval');

        if (savedName) {
            document.getElementById('name').value = savedName;
        }
        if (savedInterval) {
            intervalInput.value = savedInterval;
            intervalValue.textContent = `${savedInterval} min`;
        }
    }

    loadUserData();

    // Get catchy message (Gender Neutral)
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

    // Start Reminders
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

    function startReminders() {
        const name = document.getElementById('name').value;
        const intervalMinutes = parseInt(intervalInput.value);

        // Save to LocalStorage
        localStorage.setItem('hydrate_name', name);
        localStorage.setItem('hydrate_interval', intervalMinutes);

        // Clear existing interval if any
        if (reminderIntervalId) clearInterval(reminderIntervalId);

        // UI Updates
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        statusMessage.classList.remove('hidden');

        // Disable inputs
        document.getElementById('name').disabled = true;
        intervalInput.disabled = true;

        // Send immediate confirmation
        new Notification("HydrateMe Started", {
            body: `We'll remind you every ${intervalMinutes} minutes.`,
            icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png"
        });

        // Set Interval
        reminderIntervalId = setInterval(() => {
            const message = getReminderMessage(name);
            new Notification("Time to Hydrate!", {
                body: message,
                icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png",
                requireInteraction: true // Keeps notification until user clicks
            });
        }, intervalMinutes * 60 * 1000);
    }

    // Stop Reminders
    stopBtn.addEventListener('click', () => {
        if (reminderIntervalId) {
            clearInterval(reminderIntervalId);
            reminderIntervalId = null;
        }

        // UI Updates
        startBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
        statusMessage.classList.add('hidden');

        // Enable inputs
        document.getElementById('name').disabled = false;
        intervalInput.disabled = false;
    });
});
