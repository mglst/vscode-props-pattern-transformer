import * as ts from 'typescript';
import * as vscode from 'vscode';

export function parseDocument(document: vscode.TextDocument): ts.SourceFile {
  return ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true // setParentNodes
  );
}

export function findComponentAtPosition(
  sourceFile: ts.SourceFile,
  position: number
): ts.FunctionDeclaration | ts.ArrowFunction | null {
  let result: ts.FunctionDeclaration | ts.ArrowFunction | null = null;

  function visit(node: ts.Node) {
    if (node.pos <= position && position <= node.end) {
      if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
        if (isReactComponent(node)) {
          result = node;
        }
      }
      ts.forEachChild(node, visit);
    }
  }

  visit(sourceFile);
  return result;
}

function isReactComponent(node: ts.FunctionDeclaration | ts.ArrowFunction): boolean {
  // Check if function returns JSX
  const body = node.body;
  if (!body) return false;

  let hasJSX = false;

  function checkForJSX(node: ts.Node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
      hasJSX = true;
      return;
    }
    ts.forEachChild(node, checkForJSX);
  }

  checkForJSX(body);
  return hasJSX;
}

export function findFirstParameterType(
  component: ts.FunctionDeclaration | ts.ArrowFunction
): ts.TypeNode | undefined {
  const firstParam = component.parameters[0];
  if (!firstParam) return undefined;
  return firstParam.type;
}

export function findTypeDeclaration(
  sourceFile: ts.SourceFile,
  typeName: string
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | null {
  let result: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | null = null;

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === typeName) {
      result = node;
    } else if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
      result = node;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return result;
}
