import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

export type Monaco = typeof monacoEditor;

declare namespace loader {
  function init(): Promise<Monaco>;
  function config(params: {
    paths?: {
      vs?: string,
    },
    'vs/nls'?: {
      availableLanguages?: object,
    },
  }): void;
  function __getMonacoInstance(): Monaco | null;
}

export default loader;
