const baseURL = `https://github.cloud.capitalone.com`;
const apiURL = `${baseURL}/api/v3`;
const proxy = false;

export default <Config>{ baseURL, apiURL, proxy };
export interface Config {
  baseURL: string;
  apiURL: string;
  proxy: boolean;
}