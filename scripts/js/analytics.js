const Promise = require('bluebird');
const google = require('googleapis');
const credentials = require('../../config/google-analytics.json');
const fs = require('fs-extra');
const path = require('path');
const ms = require('ms');

let analytics;

// Dimensions and metrics: https://developers.google.com/analytics/devguides/reporting/core/dimsmets

const options = {
    startDate: `90daysAgo`,
    endDate: 'today',
};

// const options = {startDate: '2013-07-23', endDate: '2013-09-23' }

login()
    .then(_ =>
        Promise.props({
            blog: fetchStats('92672328'),
            enighet: fetchStats('115750696'),
            løfter: fetchStats('153220863'),
            sjekk: fetchStats('157552109'),
            tale: fetchStats('98310771'),
            www: fetchStats('74633289'),
            wwwOld: fetchStats('58919562')
        })
    )
    .then(stats => {
        let totalSessions = 0;

        Object.keys(stats).forEach(site => {
            totalSessions += +stats[site].totals['ga:sessions'];

            console.log(`${site}.holderdeord.no`);
            console.log(`\tSesjoner: ${stats[site].totals['ga:sessions']}`);
            console.log(
                `\tSidevisninger: ${stats[site].totals['ga:pageviews']}`
            );
            console.log(
                `\tSnitt sesjonsvarighet: ${ms(
                    stats[site].totals['ga:avgSessionDuration'] * 1000
                )}`
            );
            console.log(
                `\tBounce rate: ${(+stats[site].totals['ga:bounceRate']).toFixed(2)}`
            );
            console.log('\n');
        });

        console.log({totalSessions})

        return fs.outputJson(path.resolve(__dirname, '../../data/analytics.json'), stats);
    });

function login() {
    let jwt = new google.auth.JWT();
    jwt.fromJSON(credentials);

    jwt = Promise.promisifyAll(
        jwt.createScoped('https://www.googleapis.com/auth/analytics.readonly')
    );
    analytics = google.analytics({ version: 'v3', auth: jwt });

    Promise.promisifyAll(analytics.data.ga);
    Promise.promisifyAll(analytics.data.realtime);

    return jwt.authorizeAsync();
}

function fetchStats(viewId) {
    return analytics.data.ga
        .getAsync({
            ids: `ga:${viewId}`,
            'start-date': options.startDate,
            'end-date': options.endDate,
            metrics: 'ga:sessions,ga:pageviews,ga:avgSessionDuration,ga:bounceRate'
            // sort: '-ga:totalEvents',
            // filters: 'ga:eventCategory==hits'
        })
        .tap(res => console.log(res))
        .then(res => ({
            items: (res.rows || []).map(r =>
                res.columnHeaders.reduce(
                    (a, e, i) => Object.assign(a, { [e.name]: r[i] }),
                    {}
                )
            ),
            totals: res.totalsForAllResults
        }));
}
