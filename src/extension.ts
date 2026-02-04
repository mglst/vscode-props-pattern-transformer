import * as vscode from 'vscode';
import { PropsPatternCodeActionProvider } from './codeActions';

export function activate(context: vscode.ExtensionContext) {
  const provider = new PropsPatternCodeActionProvider();

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [
        { language: 'typescript', scheme: 'file' },
        { language: 'typescriptreact', scheme: 'file' }
      ],
      provider,
      {
        providedCodeActionKinds: [vscode.CodeActionKind.RefactorRewrite]
      }
    )
  );
}

export function deactivate() {}
