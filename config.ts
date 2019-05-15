export interface Config {
  baseURL: string;
  apiURL: string;
}

const baseURL = `https://github.cloud.capitalone.com`;
const apiURL = `${baseURL}/api/v3`

export default <Config>{ baseURL, apiURL };
