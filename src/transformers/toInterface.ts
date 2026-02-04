import * as ts from 'typescript';
import * as vscode from 'vscode';
import {
  createInterfaceDeclaration,
  createTypeReference,
  printNode,
  cloneTypeParameters,
  cloneModifiers
} from '../ast/builder';
import { getComponentName, generatePropsName, findAvailablePropsName } from '../utils/naming';

export function typeToInterface(
  typeDeclaration: ts.TypeAliasDeclaration,
  component: ts.FunctionDeclaration | ts.ArrowFunction,
  sourceFile: ts.SourceFile,
  document: vscode.TextDocument
): vscode.WorkspaceEdit {
  const edit = new vscode.WorkspaceEdit();

  // Convert type alias to interface
  const typeNode = typeDeclaration.type;
  let members: ts.TypeElement[] = [];

  if (ts.isTypeLiteralNode(typeNode)) {
    members = [...typeNode.members];
  } else {
    // If type is not a literal (e.g., intersection), we can't easily convert
    // For now, wrap it in an extends clause (this is a simplification)
    return edit; // Return empty edit if we can't convert
  }

  const interfaceDecl = createInterfaceDeclaration(
    typeDeclaration.name.text,
    members,
    cloneTypeParameters(typeDeclaration.typeParameters),
    undefined,
    cloneModifiers(typeDeclaration.modifiers)
  );

  const interfaceText = printNode(interfaceDecl, sourceFile);

  // Replace the type declaration with interface declaration
  const start = document.positionAt(typeDeclaration.pos);
  const end = document.positionAt(typeDeclaration.end);
  edit.replace(document.uri, new vscode.Range(start, end), interfaceText);

  return edit;
}

export function inlineToInterface(
  typeLiteral: ts.TypeLiteralNode,
  component: ts.FunctionDeclaration | ts.ArrowFunction,
  sourceFile: ts.SourceFile,
  document: vscode.TextDocument
): vscode.WorkspaceEdit {
  const edit = new vscode.WorkspaceEdit();

  const componentName = getComponentName(component);
  const propsName = findAvailablePropsName(generatePropsName(componentName), sourceFile);

  // Create interface declaration
  const members = [...typeLiteral.members];
  const interfaceDecl = createInterfaceDeclaration(propsName, members);
  const interfaceText = printNode(interfaceDecl, sourceFile);

  // Insert interface before component
  const componentStart = document.positionAt(component.pos);
  edit.insert(document.uri, componentStart, `${interfaceText}\n\n`);

  // Replace inline type with type reference
  const typeRef = createTypeReference(propsName);
  const typeRefText = printNode(typeRef, sourceFile);

  const paramStart = document.positionAt(typeLiteral.pos);
  const paramEnd = document.positionAt(typeLiteral.end);
  edit.replace(document.uri, new vscode.Range(paramStart, paramEnd), typeRefText);

  return edit;
}
