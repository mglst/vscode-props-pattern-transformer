import * as ts from 'typescript';
import * as vscode from 'vscode';
import { createTypeLiteral, printNode } from '../ast/builder';
import { canInlineType } from '../utils/validation';

export function interfaceToInline(
  interfaceDeclaration: ts.InterfaceDeclaration,
  component: ts.FunctionDeclaration | ts.ArrowFunction,
  paramType: ts.TypeNode,
  sourceFile: ts.SourceFile,
  document: vscode.TextDocument
): vscode.WorkspaceEdit | { error: string } {
  const validation = canInlineType(interfaceDeclaration, sourceFile);
  if (!validation.valid) {
    return { error: validation.reason || 'Cannot inline this type' };
  }

  const edit = new vscode.WorkspaceEdit();

  // Create inline type literal
  const members = [...interfaceDeclaration.members];
  const typeLiteral = createTypeLiteral(members);
  const typeText = printNode(typeLiteral, sourceFile);

  // Replace type reference with inline type
  const paramStart = document.positionAt(paramType.getStart(sourceFile));
  const paramEnd = document.positionAt(paramType.end);
  edit.replace(document.uri, new vscode.Range(paramStart, paramEnd), typeText);

  // Remove the interface declaration
  const interfaceStart = document.positionAt(interfaceDeclaration.pos);
  const interfaceEnd = document.positionAt(interfaceDeclaration.end);

  // Include any leading whitespace/newlines
  const fullStart = document.positionAt(interfaceDeclaration.getFullStart());
  edit.delete(document.uri, new vscode.Range(fullStart, interfaceEnd));

  return edit;
}

export function typeToInline(
  typeDeclaration: ts.TypeAliasDeclaration,
  component: ts.FunctionDeclaration | ts.ArrowFunction,
  paramType: ts.TypeNode,
  sourceFile: ts.SourceFile,
  document: vscode.TextDocument
): vscode.WorkspaceEdit | { error: string } {
  const validation = canInlineType(typeDeclaration, sourceFile);
  if (!validation.valid) {
    return { error: validation.reason || 'Cannot inline this type' };
  }

  const edit = new vscode.WorkspaceEdit();

  // Get the type literal from the type alias
  const typeNode = typeDeclaration.type;
  if (!ts.isTypeLiteralNode(typeNode)) {
    return { error: 'Can only inline type literals' };
  }

  const typeText = printNode(typeNode, sourceFile);

  // Replace type reference with inline type
  const paramStart = document.positionAt(paramType.getStart(sourceFile));
  const paramEnd = document.positionAt(paramType.end);
  edit.replace(document.uri, new vscode.Range(paramStart, paramEnd), typeText);

  // Remove the type declaration
  const fullStart = document.positionAt(typeDeclaration.getFullStart());
  const typeEnd = document.positionAt(typeDeclaration.end);
  edit.delete(document.uri, new vscode.Range(fullStart, typeEnd));

  return edit;
}
