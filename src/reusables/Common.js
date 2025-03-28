



export const decodeValue = (value) => {
    try {
        return atob(value)
    } catch (error) {
        // Handle any errors that occurred during the request
        console.error(`${value}-error`);
        return value

    }
};

export const encodeValue = (value) => {
    try {
        return btoa(value)
    } catch (error) {
        console.error(`${value}-error`);
        return value
        // Handle any errors that occurred during the request
    }
};

