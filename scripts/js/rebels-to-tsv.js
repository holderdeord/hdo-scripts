const fetch = require('node-fetch');
const util = require('util');
const { tsvFormat } = require('d3-dsv');
const { values } = require('lodash');
const { isWithinRange } = require('date-fns');
const flat = require('flat');

(async () => {
    try {
        const res = await fetch('https://data.holderdeord.no/data/rebels.json');

        if (res.ok) {
            const { representatives } = await res.json();

            const reps = values(representatives)
                .map(d => ({
                    name: d.name,
                    party: d.party,
                    count: {
                        s2013: d.rebel_votes.filter(v =>
                            isWithinRange(v.time, '2013-10-01', '2017-09-30')
                        ).length,
                        s2017: d.rebel_votes.filter(v =>
                            isWithinRange(v.time, '2017-10-01', '2021-09-30')
                        ).length,
                    },
                }))
                .filter(e => e.count.s2013 + e.count.s2017 > 0);

            console.log(tsvFormat(reps.map(d => flat(d))));
        } else {
            console.error(
                `request failed: ${res.url} ${res.status} ${await res.text()}`
            );
        }
    } catch (error) {
        console.error(error);
    }
})();
