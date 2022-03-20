import loader from '.';
import { errorMessages } from './validators';

// the loader utility has three methods: `config`, `init` and `__getMonacoInstance`

// 1) `.config`
// the `config` is a function with one parameter (required)
// the only parameter is a configuration object, that should be an `Object` type
// it will warn about deprecation message when there is `urls` field in
// the configuration object

describe('.config', () => {
  // test 1 - check if `config` is a function
  test('should be a function', () => {
    expect(loader.config).toBeInstanceOf(Function);
  });

  // test 2 - check if `config` throws an error when we don't pass an argument
  // check error message
  test('should throw an error when no arguments are passed', () => {
    function callConfigWithoutArguments() {
      loader.config();
    }

    expect(callConfigWithoutArguments).toThrow(errorMessages.configIsRequired);
  });

  // test 3 - check if `config` throws an error when the first argument is not an object
  // check the error message
  test('should throw an error when the first argument is not an object', () => {
    function callConfigWithNonObjectFirstArgument(config) {
      return () => loader.config(config);
    }

    expect(callConfigWithNonObjectFirstArgument('string')).toThrow(errorMessages.configType);
    expect(callConfigWithNonObjectFirstArgument([1, 2, 3])).toThrow(errorMessages.configType);
    expect(callConfigWithNonObjectFirstArgument(x => x + 1)).toThrow(errorMessages.configType);
  });

  // test 4 - check if `config` warns about deprecation when there is a `urls`
  // field in the configuration object
  test('should warn about deprecation', () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, 'warn')
      .mockImplementation(() => {});

    loader.config({ urls: '...' });

    expect(consoleWarnSpy).toHaveBeenCalledWith(errorMessages.deprecation);
    consoleWarnSpy.mockRestore();
  });
});

// 2) `.init`
// `init` is a function without parameters
// it handle the initialization process of monaco-editor
// returns an instance of monaco (with a cancelable promise)

describe('.init', () => {
  // test 1 - check if `init` is a function
  test('should be a function', () => {
    expect(loader.init).toBeInstanceOf(Function);
  });
});

// 3) `.__getMonacoInstance`
// internal helper function
// extracts stored monaco instance from module state
// returns the monaco instance or null

describe('.__getMonacoInstance', () => {
  // test 1 - check if `__getMonacoInstance` is a function
  test('should be a function', () => {
    expect(loader.__getMonacoInstance).toBeInstanceOf(Function);
  });

  // test 2 - check if `__getMonacoInstance` returns `null`
  // as the initialization (.init) wasn't triggered
  test('should return null', () => {
    expect(loader.__getMonacoInstance()).toBe(undefined);
  });
});
