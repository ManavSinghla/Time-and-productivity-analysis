import { BASE_API_URL, BASE_API_URL_LOCAL } from '../config';
function getBaseApiUrl() {
    if (process.env.NODE_ENV === 'production') {
        return BASE_API_URL;
    } else {
        return BASE_API_URL_LOCAL;
    }
}

export { getBaseApiUrl };