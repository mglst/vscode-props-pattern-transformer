import * as ts from 'typescript';

const factory = ts.factory;

export function createTypeReference(typeName: string, typeArguments?: ts.TypeNode[]): ts.TypeReferenceNode {
  return factory.createTypeReferenceNode(
    factory.createIdentifier(typeName),
    typeArguments
  );
}

export function createInterfaceDeclaration(
  name: string,
  members: ts.TypeElement[],
  typeParameters?: ts.TypeParameterDeclaration[],
  heritageClauses?: ts.HeritageClause[],
  modifiers?: ts.ModifierLike[]
): ts.InterfaceDeclaration {
  return factory.createInterfaceDeclaration(
    modifiers,
    factory.createIdentifier(name),
    typeParameters,
    heritageClauses,
    members
  );
}

export function createTypeAliasDeclaration(
  name: string,
  type: ts.TypeNode,
  typeParameters?: ts.TypeParameterDeclaration[],
  modifiers?: ts.ModifierLike[]
): ts.TypeAliasDeclaration {
  return factory.createTypeAliasDeclaration(
    modifiers,
    factory.createIdentifier(name),
    typeParameters,
    type
  );
}

export function createTypeLiteral(members: ts.TypeElement[]): ts.TypeLiteralNode {
  return factory.createTypeLiteralNode(members);
}

export function printNode(node: ts.Node, sourceFile: ts.SourceFile): string {
  const printer = ts.createPrinter({
    removeComments: false,
    newLine: ts.NewLineKind.LineFeed
  });
  return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

export function cloneTypeParameters(
  typeParameters: readonly ts.TypeParameterDeclaration[] | undefined
): ts.TypeParameterDeclaration[] | undefined {
  if (!typeParameters) return undefined;
  return typeParameters.map(tp =>
    factory.createTypeParameterDeclaration(
      tp.modifiers,
      tp.name,
      tp.constraint,
      tp.default
    )
  );
}

export function cloneModifiers(
  modifiers: readonly ts.ModifierLike[] | undefined
): ts.ModifierLike[] | undefined {
  if (!modifiers) return undefined;
  return [...modifiers];
}

export function convertHeritageToIntersection(
  heritageClauses: readonly ts.HeritageClause[] | undefined,
  typeLiteral: ts.TypeLiteralNode
): ts.TypeNode {
  if (!heritageClauses || heritageClauses.length === 0) {
    return typeLiteral;
  }

  const types: ts.TypeNode[] = [];

  // Add all extended/implemented types
  for (const clause of heritageClauses) {
    for (const type of clause.types) {
      types.push(factory.createTypeReferenceNode(type.expression as ts.Identifier, type.typeArguments));
    }
  }

  // Add the type literal itself
  types.push(typeLiteral);

  return factory.createIntersectionTypeNode(types);
}
