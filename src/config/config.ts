import * as process from 'process';

export default () => ({
  log: {
    type: process.env.LOG_TYPE ? process.env.LOG_TYPE : 'base',
    levels: process.env.LOG_LEVELS ? process.env.LOG_LEVELS : 'error,warn,log',
  },
});
