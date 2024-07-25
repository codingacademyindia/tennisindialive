const axios = require('axios');

const getWtaLiveRankings = async (req, res) => {
    try {
        const response = await axios({
            method: 'GET',
            url: 'https://tennisapi1.p.rapidapi.com/api/tennis/rankings/wta/live',
            headers: {
                'x-rapidapi-key': 'b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008',
                'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getAtpLiveRankings = async (req, res) => {
    try {
        const response = await axios({
            method: 'GET',
            url: 'https://tennisapi1.p.rapidapi.com/api/tennis/rankings/atp/live',
            headers: {
                'x-rapidapi-key': 'b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008',
                'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};


const getWtaCurrentRankings = async (req, res) => {
    try {
        const response = await axios({
            method: 'GET',
            url: 'https://tennisapi1.p.rapidapi.com/api/tennis/rankings/wta',
            headers: {
                'x-rapidapi-key': 'b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008',
                'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getAtpCurrentRankings = async (req, res) => {
    try {
        const response = await axios({
            method: 'GET',
            url: 'https://tennisapi1.p.rapidapi.com/api/tennis/rankings/atp',
            headers: {
                'x-rapidapi-key': 'b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008',
                'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};


const getAllScores = async (req, res) => {
    try {

        if(!req.query.day || !req.query.month || !req.query.year){
            return res.status(400).send("Please give day month and year");
        }
        const response = await axios({
            method: 'GET',
                url: `https://tennisapi1.p.rapidapi.com/api/tennis/events/${req.query.day}/${req.query.month}/${req.query.year}`,
                headers: {
                    'x-rapidapi-key': 'b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008',
                    'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
                }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    getWtaLiveRankings,
    getAtpLiveRankings,
    getAtpCurrentRankings,
    getWtaCurrentRankings,
    getAllScores
};
