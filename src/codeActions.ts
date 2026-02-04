import * as vscode from 'vscode';
import { parseDocument, findComponentAtPosition } from './ast/parser';
import { detectPattern, Pattern } from './detector';
import { transform } from './transformers';

export class PropsPatternCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    const sourceFile = parseDocument(document);
    const position = document.offsetAt(range.start);
    const component = findComponentAtPosition(sourceFile, position);

    if (!component) {
      return [];
    }

    const detection = detectPattern(component, sourceFile);
    if (!detection) {
      return [];
    }

    const actions: vscode.CodeAction[] = [];

    // Offer transformations to the other two patterns
    if (detection.pattern !== 'interface') {
      const action = this.createTransformAction(
        'Convert to interface',
        'interface',
        detection,
        component,
        sourceFile,
        document
      );
      if (action) actions.push(action);
    }

    if (detection.pattern !== 'type') {
      const action = this.createTransformAction(
        'Convert to type alias',
        'type',
        detection,
        component,
        sourceFile,
        document
      );
      if (action) actions.push(action);
    }

    if (detection.pattern !== 'inline') {
      const action = this.createTransformAction(
        'Convert to inline props',
        'inline',
        detection,
        component,
        sourceFile,
        document
      );
      if (action) actions.push(action);
    }

    return actions;
  }

  private createTransformAction(
    title: string,
    targetPattern: Pattern,
    detection: any,
    component: any,
    sourceFile: any,
    document: vscode.TextDocument
  ): vscode.CodeAction | null {
    const result = transform(targetPattern, detection, component, sourceFile, document);

    if ('error' in result) {
      // Could show a warning, but for now just don't offer the action
      return null;
    }

    const action = new vscode.CodeAction(title, vscode.CodeActionKind.RefactorRewrite);
    action.edit = result;
    return action;
  }
}
