import axios from 'axios';

const addParamToUrl = (url: string, params: Record<string, string | number | boolean> = {}) => {
    Object.entries(params).forEach(([key, value]) => {
        url += `${url.includes('?') ? '&' : '?'}${key}=${value}`
    })

    return url;
}

const getQuery = async (url: string, params: Record<string, string | number | boolean> = {}) => {
    url = addParamToUrl(url, params);
    
    let response = await axios.get(url);
    response = response.data;

    return response;
}

const postQuery = async (url: string, params: Record<string, string | number | boolean> = {}, 
                        body: object) => {
    url = addParamToUrl(url, params);
    
    let response = await axios.post(url, body);
    response = response.data;

    return response;
}

const putQuery = async (url: string, params: Record<string, string | number | boolean> = {}, 
                        body: object) => {
    url = addParamToUrl(url, params);
    
    let response = await axios.put(url, body);
    response = response.data;

    return response;
}

const deleteQuery = async (url: string, params: Record<string, string | number | boolean> = {}) => {
    url = addParamToUrl(url, params);
    
    let response = await axios.delete(url);
    response = response.data;

    return response;
}

export { getQuery, postQuery, putQuery, deleteQuery };