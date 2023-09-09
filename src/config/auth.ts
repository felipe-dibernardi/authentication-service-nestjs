import * as process from 'process';

export default () => ({
  auth: {
    enabled: process.env.ENABLE_AUTH
      ? JSON.parse(process.env.ENABLE_AUTH)
      : true,
    secret: process.env.JWT_SECRET ? process.env.JWT_SECRET : 'secret',
  },
});
