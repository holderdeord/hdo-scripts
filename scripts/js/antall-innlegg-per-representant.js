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
            query: {
                bool: {
                    filter: [
                        {
                            terms: {
                                session: [
                                    '2013-2014',
                                    '2014-2015',
                                    '2015-2016',
                                    '2016-2017'
                                ]
                            }
                        }
                    ]
                }
            },
            aggregations: {
                representatives: {
                    terms: {
                        field: 'name',
                        size: 1000 // maks antall representanter
                    }
                }
            },

            sort: { time: 'asc' },

            size: 1
        }
    })
    .then(result => {
        // console.log(result.hits.hits);
        csv.stringify(result.aggregations.representatives.buckets, {delimiter: '\t'}, (err, str) => {
            console.log(err || str);
        })
    }, console.error);
