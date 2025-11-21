/**
 * loader module
 * @module src/loader
 *
 * the module aims to setup monaco-editor
 * into your browser by using its `loader` script
 */

import state from 'state-local';

import defaultConfig from '../config';
import validators from '../validators';
import compose from '../utils/compose';
import deepMerge from '../utils/deepMerge';
import makeCancelable from '../utils/makeCancelable';

/** the local state of the module */
const [getState, setState] = state.create({
  config: defaultConfig,
  isInitialized: false,
  resolve: null,
  reject: null,
  monaco: null,
});

/**
 * set the loader configuration
 * @param {Object} config - the configuration object
 */
function config(globalConfig) {
  const { monaco, ...config } = validators.config(globalConfig);

  setState(state => ({
    config: deepMerge(
      state.config,
      config,
    ),
    monaco,
  }));
}

/**
 * handles the initialization of the monaco-editor
 * @return {Promise} - returns an instance of monaco (with a cancelable promise)
 */
function init() {
  const state = getState(({ monaco, isInitialized, resolve }) => ({ monaco, isInitialized, resolve }));

  if (!state.isInitialized) {
    setState({ isInitialized: true });

    if (state.monaco) {
      state.resolve(state.monaco);
      return makeCancelable(wrapperPromise);
    }

    if (window.monaco && window.monaco.editor) {
      storeMonacoInstance(window.monaco);
      state.resolve(window.monaco);
      return makeCancelable(wrapperPromise);
    }

    compose(
      injectScripts,
      getMonacoLoaderScript,
    )(configureLoader);
  }

  return makeCancelable(wrapperPromise);
}

/**
 * injects provided scripts into the document.body
 * @param {Object} script - an HTML script element
 * @return {Object} - the injected HTML script element
 */
function injectScripts(script) {
  return document.body.appendChild(script);
}

/**
 * creates an HTML script element with/without provided src
 * @param {string} [src] - the source path of the script
 * @return {Object} - the created HTML script element
 */
function createScript(src) {
  const script = document.createElement('script');
  if (state.config.cspNonce) {
		script.setAttribute('nonce', state.config.cspNonce);
  }
  return (src && (script.src = src), script);
}

/**
 * creates an HTML script element with the monaco loader src
 * @return {Object} - the created HTML script element
 */
function getMonacoLoaderScript(configureLoader) {
  const state = getState(({ config, reject }) => ({ config, reject }));

  const loaderScript = createScript(`${state.config.paths.vs}/loader.js`);
  loaderScript.onload = () => configureLoader();

  loaderScript.onerror = state.reject;

  return loaderScript;
}

/**
 * configures the monaco loader
 */
function configureLoader() {
  const state = getState(
    ({ config, resolve, reject }) => ({ config, resolve, reject })
  );

  const require = window.require;

  require.config(state.config);
  require(
    ['vs/editor/editor.main'],
    function(loaded) {
      const monaco = loaded.m /* for 0.53 & 0.54 */ || loaded /* for other versions */;
      storeMonacoInstance(monaco);
      state.resolve(monaco);
    },
    function(error) {
      state.reject(error);
    },
  );
}

/**
 * store monaco instance in local state
 */
function storeMonacoInstance(monaco) {
  if (!getState().monaco) {
    setState({ monaco });
  }
}

/**
 * internal helper function
 * extracts stored monaco instance
 * @return {Object|null} - the monaco instance
 */
function __getMonacoInstance() {
  return getState(({ monaco }) => monaco);
}

const wrapperPromise = new Promise((resolve, reject) => setState({ resolve, reject }));

export default { config, init, __getMonacoInstance };
