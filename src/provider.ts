/*---------------------------------------------------------
 * Copyright (C) Versa Blend Softwares. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import ReferencesDocument from './referencesDocument';

export default class Provider implements vscode.TextDocumentContentProvider, vscode.DocumentLinkProvider {

	static scheme = 'references';

	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	private _documents = new Map<string, ReferencesDocument>();
	private _editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
	private _subscriptions: vscode.Disposable;

	constructor() {
		this._subscriptions = vscode.workspace.onDidCloseTextDocument(doc => this._documents.delete(doc.uri.toString()));
	}

	dispose() {
		this._subscriptions.dispose();
		this._documents.clear();
		this._editorDecoration.dispose();
		this._onDidChange.dispose();
	}
	
	get onDidChange() {
		return this._onDidChange.event;
	}

	provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
		const document = this._documents.get(uri.toString());
		if (document) {
			return document.value;
		}
		const [target, pos] = decodeLocation(uri);
		return vscode.commands.executeCommand<vscode.Location[]>('vscode.executeReferenceProvider', target, pos).then(locations => {
			locations = locations || [];

			let idx = 0;
			locations.sort(Provider._compareLocations).find((loc, i) => loc.uri.toString() === target.toString() && !!(idx = i) && true);
			locations.push(...locations.splice(0, idx));

			const document = new ReferencesDocument(uri, locations, this._onDidChange);
			this._documents.set(uri.toString(), document);
			return document.value;
		});
	}

	private static _compareLocations(a: vscode.Location, b: vscode.Location): number {
		if (a.uri.toString() < b.uri.toString()) {
			return -1;
		} else if (a.uri.toString() > b.uri.toString()) {
			return 1;
		} else {
			return a.range.start.compareTo(b.range.start);
		}
	}

	provideDocumentLinks(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.DocumentLink[] | undefined {
		const doc = this._documents.get(document.uri.toString());
		if (doc) {
			return doc.links;
		}
	}
}

let seq = 0;

export function encodeLocation(uri: vscode.Uri, pos: vscode.Position): vscode.Uri {
	const query = JSON.stringify([uri.toString(), pos.line, pos.character]);
	return vscode.Uri.parse(`${Provider.scheme}:References.locations?${query}#${seq++}`);
}

export function decodeLocation(uri: vscode.Uri): [vscode.Uri, vscode.Position] {
	const [target, line, character] = JSON.parse(uri.query) as [string, number, number];
	return [vscode.Uri.parse(target), new vscode.Position(line, character)];
}
