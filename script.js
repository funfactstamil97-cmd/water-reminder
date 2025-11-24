document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reminderForm');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    // Chip Selection Logic
    const chips = document.querySelectorAll('.chip');
    const hiddenIntervalInput = document.getElementById('interval');
    const statusMessage = document.getElementById('statusMessage');

    let reminderIntervalId = null;

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove active class from all
            chips.forEach(c => c.classList.remove('active'));
            // Add active to clicked
            chip.classList.add('active');
            // Update hidden input
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
            hiddenIntervalInput.value = savedInterval;
            // Update active chip
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
        const intervalMinutes = parseInt(hiddenIntervalInput.value);

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
        chips.forEach(c => c.style.pointerEvents = 'none'); // Disable chips

        // Send immediate confirmation
        new Notification("HydrateMe Started", {
            body: `We'll remind you every ${intervalMinutes} minute${intervalMinutes > 1 ? 's' : ''}.`,
            icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png"
        });

        // Set Interval
        // Using 60000ms for 1 minute. 
        const intervalMs = intervalMinutes * 60 * 1000;

        console.log(`Starting reminder for ${intervalMinutes} minutes (${intervalMs}ms)`);

        reminderIntervalId = setInterval(() => {
            const message = getReminderMessage(name);
            console.log("Triggering notification:", message);

            new Notification("Time to Hydrate!", {
                body: message,
                icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png",
                requireInteraction: true, // Keeps notification until user clicks
                tag: 'hydration-reminder' // Prevents stacking if multiple fire
            });
        }, intervalMs);
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
        chips.forEach(c => c.style.pointerEvents = 'auto'); // Enable chips
    });
});
