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
      const title = detection.pattern === 'inline'
        ? 'Extract props to interface'
        : 'Convert props type alias to interface';
      const kind = detection.pattern === 'inline'
        ? vscode.CodeActionKind.RefactorExtract
        : vscode.CodeActionKind.RefactorRewrite;

      const action = this.createTransformAction(
        title,
        kind,
        'interface',
        detection,
        component,
        sourceFile,
        document
      );
      if (action) actions.push(action);
    }

    if (detection.pattern !== 'type') {
      const title = detection.pattern === 'inline'
        ? 'Extract props to type alias'
        : 'Convert props interface to type alias';
      const kind = detection.pattern === 'inline'
        ? vscode.CodeActionKind.RefactorExtract
        : vscode.CodeActionKind.RefactorRewrite;

      const action = this.createTransformAction(
        title,
        kind,
        'type',
        detection,
        component,
        sourceFile,
        document
      );
      if (action) actions.push(action);
    }

    if (detection.pattern !== 'inline') {
      const title = detection.pattern === 'interface'
        ? 'Inline props interface to object literal'
        : 'Inline props type alias to object literal';

      const action = this.createTransformAction(
        title,
        vscode.CodeActionKind.RefactorRewrite,
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
    kind: vscode.CodeActionKind,
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

    const action = new vscode.CodeAction(title, kind);
    action.edit = result;
    return action;
  }
}
