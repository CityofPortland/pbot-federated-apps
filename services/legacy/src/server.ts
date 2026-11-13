import schema from './schema.js';
import { createApp } from './app.js';
import { configureLogging, traceResolvers } from './logging.js';

const logger = configureLogging();
traceResolvers(schema);
const port = Number(process.env.PORT || 4000);
const app = createApp(schema);
app.listen(port, '0.0.0.0', () => {
  logger.info('Server listening', { port, path: '/' });
});
