import * as ts from 'typescript';
import { findFirstParameterType, findTypeDeclaration } from './ast/parser';

export type Pattern = 'interface' | 'type' | 'inline';

export interface DetectionResult {
  pattern: Pattern;
  typeNode: ts.TypeNode;
  typeDeclaration?: ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
}

export function detectPattern(
  component: ts.FunctionDeclaration | ts.ArrowFunction,
  sourceFile: ts.SourceFile
): DetectionResult | null {
  const paramType = findFirstParameterType(component);
  if (!paramType) return null;

  // Check if it's a type reference (interface or type alias)
  if (ts.isTypeReferenceNode(paramType)) {
    const typeName = paramType.typeName.getText(sourceFile);
    const typeDeclaration = findTypeDeclaration(sourceFile, typeName);

    if (!typeDeclaration) return null;

    if (ts.isInterfaceDeclaration(typeDeclaration)) {
      return {
        pattern: 'interface',
        typeNode: paramType,
        typeDeclaration
      };
    } else if (ts.isTypeAliasDeclaration(typeDeclaration)) {
      return {
        pattern: 'type',
        typeNode: paramType,
        typeDeclaration
      };
    }
  }

  // Check if it's an inline type literal
  if (ts.isTypeLiteralNode(paramType)) {
    return {
      pattern: 'inline',
      typeNode: paramType
    };
  }

  return null;
}
