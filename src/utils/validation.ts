import * as ts from 'typescript';

export function canInlineType(
  typeDeclaration: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
  sourceFile: ts.SourceFile
): { valid: boolean; reason?: string } {
  const typeName = typeDeclaration.name.text;
  let usageCount = 0;

  function visit(node: ts.Node) {
    if (ts.isTypeReferenceNode(node)) {
      const refName = node.typeName.getText(sourceFile);
      if (refName === typeName) {
        usageCount++;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // If used more than once, cannot inline
  if (usageCount > 1) {
    return {
      valid: false,
      reason: `Type "${typeName}" is used ${usageCount} times. Cannot inline a shared type.`
    };
  }

  // If exported, should probably not inline (warning)
  const isExported = typeDeclaration.modifiers?.some(
    m => m.kind === ts.SyntaxKind.ExportKeyword
  );

  if (isExported) {
    return {
      valid: false,
      reason: `Type "${typeName}" is exported. Inlining would remove the export.`
    };
  }

  return { valid: true };
}
