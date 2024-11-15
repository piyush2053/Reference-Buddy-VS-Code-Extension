import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vbs" is now active!');
	const disposable = vscode.commands.registerCommand('vbs.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from vbs!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
