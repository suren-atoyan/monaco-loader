import curry from '../utils/curry';
import isObject from '../utils/isObject';

/**
 * validates the configuration object and informs about deprecation
 * @param {Object} config - the configuration object 
 * @return {Object} config - the validated configuration object
 */
function validateConfig(config) {
  if (!config) errorHandler('configIsRequired');
  if (!isObject(config)) errorHandler('configType');
  if (config.urls) {
    informAboutDeprecation();
    return { paths: { vs: config.urls.monacoBase } };
  }

  return config;
}

/**
 * logs deprecation message
 */
function informAboutDeprecation() {
  console.warn(errorMessages.deprecation);
}

function throwError(errorMessages, type) {
  throw new Error(errorMessages[type] || errorMessages.default);
}

const errorMessages = {
  configIsRequired: 'the configuration object is required',
  configType: 'the configuration object should be an object',
  default: 'an unknown error accured in `@monaco-editor/loader` package',

  deprecation: `Deprecation warning!
    You are using deprecated way of configuration.

    Instead of using
      monaco.config({ urls: { monacoBase: '...' } })
    use
      monaco.config({ paths: { vs: '...' } })

    For more please check the link https://github.com/suren-atoyan/monaco-loader#config
  `,
};

const errorHandler = curry(throwError)(errorMessages);

const validators = {
  config: validateConfig,
};

export default validators;

export { errorMessages, errorHandler };
