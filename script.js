function openApp(name) {
    const screen = document.getElementById("screen");

    screen.innerHTML = `
        <div style="padding:25px; text-align:center;">
            <h1>${name}</h1>
            <p>Willkommen bei NEXI PHONE</p>
            <button onclick="goHome()">Zurück zum Homescreen</button>
        </div>
    `;
}

function goHome() {
    location.reload();
}

function updateClock() {
    const now = new Date();

    const clock = document.getElementById("clock");
    const date = document.getElementById("date");

    if (clock) {
        clock.textContent = now.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    if (date) {
        date.textContent = now.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
    }
}

setInterval(updateClock, 1000);
updateClock();
