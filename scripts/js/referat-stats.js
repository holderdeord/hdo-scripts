const es = require('elasticsearch');
const csv = require('csv');
const client = new es.Client({
    host: 'https://search.holderdeord.no',
    log: 'warning'
});

client
    .search({
        index: 'hdo-transcripts',
        body: {
            aggregations: {
                representatives: {
                    cardinality: { field: 'name' }
                }
            },

            size: 0
        }
    })
    .then(result => {
        console.log(JSON.stringify(result, null, 2));
    }, console.error);
