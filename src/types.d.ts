import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

export type Monaco = typeof monacoEditor;

declare namespace monaco {
  function init(): Promise<Monaco>;
  function config(params: {
    paths?: {
      vs?: string,
    },
    'vs/nls'?: {
      availableLanguages?: object,
    },
  }): void
}

export default monaco;
