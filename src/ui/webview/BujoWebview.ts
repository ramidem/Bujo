import * as vscode from 'vscode';
import { getNonce, getWebviewOptions } from '../../helpers';

/**
 * Manages Bujo Webview Panels
 */
export default class BujoWebview {
  // track and allow single panel at a time
  public static currentPanel: BujoWebview | undefined;

  public static readonly viewType = 'bujo';
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // set the webview's initial html content
    this._update();
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // show existing panel
    if (BujoWebview.currentPanel) {
      BujoWebview.currentPanel._panel.reveal(column);
      return;
    }

    // otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      BujoWebview.viewType,
      'Bujo',
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri),
    );

    BujoWebview.currentPanel = new BujoWebview(panel, extensionUri);
  }

  private _update() {
    const webview = this._panel.webview;

    this._panel.webview.html = this._getHtmlForWebview(webview);

    webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'onInfo':
          if (!data.value) {
            return;
          }

          vscode.window.showInformationMessage(data.value);
          break;
        case 'onError':
          if (!data.value) {
            return;
          }

          vscode.window.showErrorMessage(data.value);
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'),
    );

    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'),
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out/compiled', 'helloBujo.js'),
    );

    const nonce = getNonce();

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <!--
        Use a content security policy to only allow loading images from https or from our extension directory,
        and only allow scripts that have a specific nonce.
      -->
      <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${stylesResetUri}" rel="stylesheet">
      <link href="${stylesMainUri}" rel="stylesheet">
      <script nonce="${nonce}">
      </script>
    </head>
    <body>
      <h1>Bujo</h1>
      <p>A Bullet Journal for VS Code.</p>
    </body>
    <script src="${scriptUri}" nonce="${nonce}">
    </html>
    `;
  }
}
