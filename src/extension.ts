/*---------------------------------------------------------
 * Copyright (C) Versa Blend Softwares. All rights reserved.
 *--------------------------------------------------------*/

import { workspace, languages, window, commands, ExtensionContext, Disposable } from 'vscode';
import ContentProvider, { encodeLocation } from './provider';

export function activate(context: ExtensionContext) {

	const provider = new ContentProvider();
	const providerRegistrations = Disposable.from(
		workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider),
		languages.registerDocumentLinkProvider({ scheme: ContentProvider.scheme }, provider)
	);
	const commandRegistration = commands.registerTextEditorCommand('editor.printReferences', editor => {
		const uri = encodeLocation(editor.document.uri, editor.selection.active);
		return workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, editor.viewColumn! + 1));
	});

	context.subscriptions.push(
		provider,
		commandRegistration,
		providerRegistrations
	);
}


// 62VRwbF9FWh9bnDX9eMc1lTrBgyhqxQQospfVIS1NbZVtIawGtmjJQQJ99AKACAAAAAAAAAAAAAGAZDOvU41