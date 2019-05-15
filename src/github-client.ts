import Octokit from '@octokit/rest';

import config from '../config';
import { Token } from './token';

const HttpsProxyAgent = require('https-proxy-agent');

const githubToken = new Token('GITHUB_ACCESS_TOKEN');
const proxyToken = new Token('HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy');

const agent = config.proxy ? new HttpsProxyAgent(proxyToken.value) : undefined;

export const githubClient = new Octokit({
  auth: githubToken.value,
  baseUrl: config.apiURL,
  request: { agent }
});
