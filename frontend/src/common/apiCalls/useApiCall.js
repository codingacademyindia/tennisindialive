import { useEffect, useReducer, useState } from 'react';
import axios from 'axios';

// Define action types
const API_REQUEST = 'API_REQUEST';
const API_SUCCESS = 'API_SUCCESS';
const API_FAILURE = 'API_FAILURE';

// Reducer function
const apiReducer = (state, action) => {
  switch (action.type) {
    case API_REQUEST:
      return { ...state, loading: true, error: null };
    case API_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case API_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const useApiCall = (apiRequest) => {
  const [request, setRequest] = useState(apiRequest);
  const [state, dispatch] = useReducer(apiReducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: API_REQUEST });

      try {
        if (request.method === 'get') {
          const response = await axios.get(request.url, {
            headers: request.headers ? request.headers : {},
            params: request.params ? request.params : {}
        });
          dispatch({ type: API_SUCCESS, payload: response.data });
        }
        else if (request.method === 'post') {
          const response = await axios.post(request.url, request.payload);
          dispatch({ type: API_SUCCESS, loading: response.loading, payload: response.data, headers: request.request?request.headers:[] });
        }
        else if (request.method === 'image') {
          const response = await axios.get(request.url, request.payload);
          dispatch({ type: API_SUCCESS, loading: response.loading,payload: response.data, headers: request.request?request.headers:[] });
        }

        else if (request.method === 'put') {
          // axios.defaults.headers.post['content-type'] = 'application/json'
          const response = await axios.put(request.url, request.payload);
          dispatch({ type: API_SUCCESS, loading: response.loading, payload: response.data,headers: request.headers?request.headers:[] });
        }
        else if (request.method === 'delete') {
          const response = await axios.delete(request.url, request.payload);
          dispatch({ type: API_SUCCESS, payload: response.data });
        }

      } catch (error) {
        dispatch({ type: API_FAILURE, payload: error.message });
      }
    };
    if (request.url!=="") {
      fetchData();
    }
  }, [request]);

  return { ...state, setRequest };
};

export default useApiCall;