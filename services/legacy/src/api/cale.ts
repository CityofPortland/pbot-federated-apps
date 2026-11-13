import axios from 'axios';
import { traceRequests } from './logging.js';

const client = axios.create();
traceRequests(client, 'cale');

export default client;
