export class ConfigurationMissingError extends Error {
  constructor(key: string) {
    super(`Missing property ${key} on configuration file`);
  }
}
