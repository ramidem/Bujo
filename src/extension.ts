import * as vscode from 'vscode';
import { BujoWebview } from './ui';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('bujo.start', () => {
      BujoWebview.createOrShow(context.extensionUri);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('bujo.open', () => {
      vscode.window.showInformationMessage('Hello Bujo!');
    }),
  );
}

export function deactivate() {}
