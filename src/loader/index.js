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
import deepMerge from '../utils/deepMerge';
import makeCancelable from '../utils/makeCancelable';

/** the local state of the module */
const [getState, setState] = state.create({
  config: defaultConfig,
  isInitialized: false,
  monaco: null,
});

/**
 * set the loader configuration
 * @param {Object} config - the configuration object
 */
function config(config) {
  setState((state) => ({
    config: deepMerge(state.config, validators.config(config)),
  }));
}
let resultPromise = null;
/**
 * handles the initialization of the monaco-editor
 * @return {Promise} - returns an instance of monaco (with a cancelable promise)
 */
function init({ monaco } = {}) {
  const state = getState(({ isInitialized }) => ({ isInitialized }));

  if (!state.isInitialized && !resultPromise) {
    if (window.monaco && window.monaco.editor) {
      storeMonacoInstance(window.monaco);
      resultPromise = makeCancelable(Promise.resolve(window.monaco));
      return resultPromise;
    } else if (monaco) {
      storeMonacoInstance(monaco);
      resultPromise = makeCancelable(Promise.resolve(monaco));
      return resultPromise;
    } else {
      resultPromise = makeCancelable(
        getMonacoLoaderScript().then(configureLoader)
      );
    }
  }

  return resultPromise;
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
  return src && (script.src = src), script;
}

/**
 * creates an HTML script element with the monaco loader src
 * @return {Object} - the created HTML script element
 */
function getMonacoLoaderScript() {
  const state = getState();

  const loaderScript = createScript(`${state.config.paths.vs}/loader.js`);
  return new Promise((resolve, reject) => {
    loaderScript.onload = () => {
      resolve();
    };
    loaderScript.onerror = reject;
    injectScripts(loaderScript);
  });
}

/**
 * configures the monaco loader
 */
function configureLoader() {
  const state = getState(({ config }) => ({ config }));

  const require = window.require;

  require.config(state.config);

  return new Promise((resolve, reject) => {
    require(['vs/editor/editor.main'], function (monaco) {
      storeMonacoInstance(monaco);
      resolve(monaco);
    }, function (error) {
      reject(error);
    });
  });
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

function dispose() {
  resultPromise = null;
  setState({
    config: defaultConfig,
    isInitialized: false,
    monaco: null,
  });
}

export default { config, init, dispose, __getMonacoInstance };
