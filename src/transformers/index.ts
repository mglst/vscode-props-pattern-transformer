import * as ts from 'typescript';
import * as vscode from 'vscode';
import { Pattern, DetectionResult } from '../detector';
import { interfaceToType, inlineToType } from './toType';
import { typeToInterface, inlineToInterface } from './toInterface';
import { interfaceToInline, typeToInline } from './toInline';

export function transform(
  targetPattern: Pattern,
  detection: DetectionResult,
  component: ts.FunctionDeclaration | ts.ArrowFunction,
  sourceFile: ts.SourceFile,
  document: vscode.TextDocument
): vscode.WorkspaceEdit | { error: string } {
  const currentPattern = detection.pattern;

  // Same pattern - no transformation needed
  if (currentPattern === targetPattern) {
    return { error: 'Already using this pattern' };
  }

  // Route to appropriate transformer
  if (targetPattern === 'interface') {
    if (currentPattern === 'type') {
      return typeToInterface(detection.typeDeclaration as ts.TypeAliasDeclaration, component, sourceFile, document);
    } else if (currentPattern === 'inline') {
      return inlineToInterface(detection.typeNode as ts.TypeLiteralNode, component, sourceFile, document);
    }
  } else if (targetPattern === 'type') {
    if (currentPattern === 'interface') {
      return interfaceToType(detection.typeDeclaration as ts.InterfaceDeclaration, component, sourceFile, document);
    } else if (currentPattern === 'inline') {
      return inlineToType(detection.typeNode as ts.TypeLiteralNode, component, sourceFile, document);
    }
  } else if (targetPattern === 'inline') {
    if (currentPattern === 'interface') {
      return interfaceToInline(
        detection.typeDeclaration as ts.InterfaceDeclaration,
        component,
        detection.typeNode,
        sourceFile,
        document
      );
    } else if (currentPattern === 'type') {
      return typeToInline(
        detection.typeDeclaration as ts.TypeAliasDeclaration,
        component,
        detection.typeNode,
        sourceFile,
        document
      );
    }
  }

  return { error: 'Unsupported transformation' };
}
