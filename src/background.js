'use strict';

chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {hostSuffix: 'novelkeys.xyz'},
				}),
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {hostSuffix: 'cannonkeys.com'},
				})
			],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});
