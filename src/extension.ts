import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "bujo" is now active!');

	let disposable = vscode.commands.registerCommand('bujo.open', () => {
		vscode.window.showInformationMessage('Hello Bujo!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
