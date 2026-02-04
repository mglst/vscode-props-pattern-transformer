import * as ts from 'typescript';

export function generatePropsName(componentName: string): string {
  // Remove common suffixes if they exist
  const cleanName = componentName.replace(/Component$/, '');
  return `${cleanName}Props`;
}

export function getComponentName(
  component: ts.FunctionDeclaration | ts.ArrowFunction
): string {
  if (ts.isFunctionDeclaration(component) && component.name) {
    return component.name.text;
  }

  // For arrow functions, try to get the name from the parent variable declaration
  const parent = component.parent;
  if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
    return parent.name.text;
  }

  return 'Component';
}

export function findAvailablePropsName(
  baseName: string,
  sourceFile: ts.SourceFile
): string {
  let name = baseName;
  let counter = 2;

  while (nameExists(name, sourceFile)) {
    name = `${baseName}${counter}`;
    counter++;
  }

  return name;
}

function nameExists(name: string, sourceFile: ts.SourceFile): boolean {
  let exists = false;

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === name) {
      exists = true;
    } else if (ts.isTypeAliasDeclaration(node) && node.name.text === name) {
      exists = true;
    }
    if (!exists) {
      ts.forEachChild(node, visit);
    }
  }

  visit(sourceFile);
  return exists;
}
