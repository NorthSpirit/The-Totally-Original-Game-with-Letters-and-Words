//Function to get base date, based on GMT0 timeline, regardless of user's actual device, allowing people to basically do the same "dailies"
//Helper function of daily seed in Game.js
async function getDailySeed() {
    const now = new Date();
    const utcDate = now.toISOString().split('T')[0];

    return utcDate;
}

//Old version was overengineered AF, basically, it was uncheatable, but also it felt horrible
//Basically, with this, you would load up HTML and then wait 20-30 seconds for it to check all the possible sources for "What date it is"
//Also, technically, it had to check 3 sources, cause it would always be like 1 is down, other has API issues
//So it rolled back to my "simple" version 1/4th of the time anyhow
//Which, in retrospec, is mental...
//I suppose, you can use it, if you'll ever want to do a banking app with java script of all things...
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