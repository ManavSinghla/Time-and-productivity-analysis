import { BASE_API_URL, BASE_API_URL_LOCAL } from '../config';

export const getBaseApiUrl = () => {
    let url = import.meta.env.VITE_API_BASE_URL;

    if (!url) {
        if (import.meta.env.MODE === 'production') {
            url = BASE_API_URL;
        } else {
            url = BASE_API_URL_LOCAL;
        }
    }

    return url.replace(/\/$/, "");
};
