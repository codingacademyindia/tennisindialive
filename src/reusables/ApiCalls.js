import axios from 'axios';




export const getData = async (url) => {
    try {
        return await axios.get(url);
    } catch (error) {
        // Handle any errors that occurred during the request
        console.error(error);
    }
};

export const deleteData = async (url) => {
    try {
        return await axios.delete(url);
    } catch (error) {
        // Handle any errors that occurred during the request
        console.error(error);
    }
};


export async function fetchData(url) {
    try {
        return await axios.get(url).then((response) => {
            return response.data
        })
    } catch (error) {
        // Handle any errors that occurred during the request
        console.error(error);
    }
};


export async function putData(url, payload) {
    try {
        return await axios.put(url,  payload).then((response) => {
            return response.data
        })
    } catch (error) {
        // Handle any errors that occurred during the request
        console.error(error);
    }
};

