import axios from 'axios';
import axiosRetry from 'axios-retry';

const defaultRetryConfig = {
  retries: 5,
  initialDelayMS: 100,
};

export default class HttpClient {
  constructor(
    baseURL,
    authErrorEventBus,
    getCsrfToken,
    config = defaultRetryConfig
  ) {
    this.config = config;
    this.client = axios.create({
      baseURL: baseURL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    axiosRetry(this.client, {
      retries: this.config.retries,
      retryDelay: (retry) => {
        const delay = Math.pow(2, retry) * this.config.initialDelayMS;
        const jitter = delay * 0.1 * Math.random();
        return delay + jitter;
      },
      retryCondition: (err) =>
        axiosRetry.isNetworkOrIdempotentRequestError(err) ||
        err.response.status === 429,
    });
    this.authErrorEventBus = authErrorEventBus;
    this.getCsrfToken = getCsrfToken;
  }
  async fetch(url, options) {
    const { body, method, headers } = options;
    const request = {
      url,
      method,
      headers: {
        ...headers,
        'twitter-csrf-token': this.getCsrfToken(),
      },
      data: body,
    };

    try {
      const response = await this.client(request);
      return response.data;
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        const message =
          data && data.message ? data.message : 'something went wrong!!!';
        throw new Error(message);
      }
      throw new Error('connection error');
    }
  }
}
