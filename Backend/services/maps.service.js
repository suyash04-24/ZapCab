const axios = require('axios');
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.OLA_MAPS_API_KEY;
    const url = `https://maps.ola.com/api/geocode?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error('Ola Maps Geocode Error:', error);
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.OLA_MAPS_API_KEY;
    const url = `https://maps.ola.com/api/distancematrix?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            if (response.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }
            return response.data.rows[0].elements[0];
        } else {
            throw new Error('Unable to fetch distance and time');
        }
    } catch (err) {
        console.error('Ola Maps Distance Matrix Error:', err);
        throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        return [];
    }

    const apiKey = process.env.OLA_MAPS_API_KEY;
    const url = `https://maps.ola.com/api/place/autocomplete?input=${encodeURIComponent(input)}&key=${apiKey}&types=address`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => ({
                description: prediction.description,
                place_id: prediction.place_id
            }));
        } else {
            return [];
        }
    } catch (err) {
        console.error('Ola Maps Autocomplete Error:', err);
        return [];
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    // radius in km
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[ltd, lng], radius / 6371]
            }
        }
    });

    return captains;
}