// Import VS Code and ts-morph modules
import * as vscode from 'vscode';
import { Project, SyntaxKind } from 'ts-morph';

export function activate(context: vscode.ExtensionContext) {
    console.error('Error log: Extension activated');
    console.log('Extension activated');
    vscode.window.showInformationMessage('Extension has been activated');

    // Register the folding range provider for TypeScript and JavaScript files
    const foldingProvider = vscode.languages.registerFoldingRangeProvider(
        [{ language: 'typescript', scheme: 'file' }, { language: 'javascript', scheme: 'file' }],
        new FunctionCommentFoldingProvider()
    );

    context.subscriptions.push(foldingProvider);
}

class FunctionCommentFoldingProvider implements vscode.FoldingRangeProvider {

    provideFoldingRanges(
        document: vscode.TextDocument,
        context: vscode.FoldingContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FoldingRange[]> {
        const foldingRanges: vscode.FoldingRange[] = [];
        const text = document.getText();  // Get the entire document text

        // Initialize ts-morph project and source file
        const project = new Project();
        const sourceFile = project.createSourceFile('temp.ts', text, { overwrite: true });

        // Traverse the source file to find functions and their body contents
        const functions = sourceFile.getFunctions();  // Includes function declarations
        const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);  // Get arrow functions
        
        functions.forEach(func => {
            const start = func.getStartLineNumber() - 1;
            const end = func.getEndLineNumber() - 1;

            // Check for comments within the function body
            const bodyText = func.getBodyText() || '';
            const lines = bodyText.split('\n');
            lines.forEach((line, i) => {
                if (line.trim().startsWith('//')) {
                    // Fold from this comment line onwards
                    foldingRanges.push(new vscode.FoldingRange(start + i, end));
                }
            });
        });

        // Handle arrow functions similarly
        arrowFunctions.forEach(arrowFunc => {
            const start = arrowFunc.getStartLineNumber() - 1;
            const end = arrowFunc.getEndLineNumber() - 1;

            const bodyText = arrowFunc.getBodyText() || '';
            const lines = bodyText.split('\n');
            lines.forEach((line, i) => {
                if (line.trim().startsWith('//')) {
                    // Fold from this comment line onwards
                    foldingRanges.push(new vscode.FoldingRange(start + i, end));
                }
            });
        });

        return foldingRanges;
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
