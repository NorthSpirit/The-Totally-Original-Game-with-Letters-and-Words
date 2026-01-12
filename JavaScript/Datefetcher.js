async function getDailySeed() {
    const now = new Date();
    const utcDate = now.toISOString().split('T')[0];

    return utcDate;
}
/*
async function getDailySeed() {
    const sources = [
        'https://worldtimeapi.org/api/timezone/Etc/UTC',
        'https://timeapi.io/api/Time/current/zone?timeZone=UTC',
        'https://date.nager.at/api/v3/NextPublicHolidaysWorldwide'
    ];

    for (let url of sources) {
        try {
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) continue;
            const data = await response.json();
            
            const rawDate = data.datetime || data.dateTime;
            if (rawDate) return rawDate.split('T')[0];
        } catch (e) {
            console.error(`Source ${url} failed`);
        }
    }

    try {
        const now = new Date(); 
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return "Error: Could not sync time";
    }
}
*/