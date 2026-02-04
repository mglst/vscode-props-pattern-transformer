import * as ts from 'typescript';
import * as vscode from 'vscode';
import {
  createTypeAliasDeclaration,
  createTypeReference,
  createTypeLiteral,
  printNode,
  cloneTypeParameters,
  cloneModifiers,
  convertHeritageToIntersection
} from '../ast/builder';
import { getComponentName, generatePropsName, findAvailablePropsName } from '../utils/naming';

export function interfaceToType(
  interfaceDeclaration: ts.InterfaceDeclaration,
  component: ts.FunctionDeclaration | ts.ArrowFunction,
  sourceFile: ts.SourceFile,
  document: vscode.TextDocument
): vscode.WorkspaceEdit {
  const edit = new vscode.WorkspaceEdit();

  // Convert interface to type alias
  const members = [...interfaceDeclaration.members];
  const typeLiteral = createTypeLiteral(members);

  // Handle heritage clauses (extends)
  const typeNode = convertHeritageToIntersection(interfaceDeclaration.heritageClauses, typeLiteral);

  const typeDecl = createTypeAliasDeclaration(
    interfaceDeclaration.name.text,
    typeNode,
    cloneTypeParameters(interfaceDeclaration.typeParameters),
    cloneModifiers(interfaceDeclaration.modifiers)
  );

  const typeText = printNode(typeDecl, sourceFile);

  // Replace the interface declaration with type declaration
  const start = document.positionAt(interfaceDeclaration.pos);
  const end = document.positionAt(interfaceDeclaration.end);
  edit.replace(document.uri, new vscode.Range(start, end), typeText);

  return edit;
}

export function inlineToType(
  typeLiteral: ts.TypeLiteralNode,
  component: ts.FunctionDeclaration | ts.ArrowFunction,
  sourceFile: ts.SourceFile,
  document: vscode.TextDocument
): vscode.WorkspaceEdit {
  const edit = new vscode.WorkspaceEdit();

  const componentName = getComponentName(component);
  const propsName = findAvailablePropsName(generatePropsName(componentName), sourceFile);

  // Create type alias declaration
  const typeDecl = createTypeAliasDeclaration(propsName, typeLiteral);
  const typeText = printNode(typeDecl, sourceFile);

  // Insert type before component
  const componentStart = document.positionAt(component.pos);
  edit.insert(document.uri, componentStart, `${typeText}\n\n`);

  // Replace inline type with type reference
  const typeRef = createTypeReference(propsName);
  const typeRefText = printNode(typeRef, sourceFile);

  const paramStart = document.positionAt(typeLiteral.pos);
  const paramEnd = document.positionAt(typeLiteral.end);
  edit.replace(document.uri, new vscode.Range(paramStart, paramEnd), typeRefText);

  return edit;
}
