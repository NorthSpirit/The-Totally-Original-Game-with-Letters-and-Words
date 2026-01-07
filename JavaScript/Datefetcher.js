async function getDailySeed() {
    const sources = [
        'https://worldtimeapi.org/api/timezone/Etc/UTC',
        'https://timeapi.io/api/Time/current/zone?timeZone=UTC'
    ];

    for (let url of sources) {
        try {
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) continue;
            const data = await response.json();
            
            const rawDate = data.datetime || data.dateTime;
            return rawDate.split('T')[0];
        } catch (e) {
            console.error(`Source ${url} failed, trying next...`);
        }
    }
    return "Error: Could not sync time"; 
}