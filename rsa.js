"use strict";

let asymmetricBits = 2048;

let asymmetricOptions = {
	name: "RSA-OAEP",
	modulusLength: asymmetricBits,
	publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
	hash: {name: "SHA-256"}
};

function generateKeyPair(bits, exportable, operations) {
	return window.crypto.subtle.generateKey(
		asymmetricOptions,
		exportable,
		operations
	);
}

let symmetricOptions = {
	name: "AES-GCM",
	length: 256
};

function encrypt(publicKey, message) {
	return window.crypto.subtle.generateKey(
		symmetricOptions,
		true, //exportable
		["encrypt", "wrapKey"]
	).then(function(ephemeral) {
		let iv = window.crypto.getRandomValues(new Uint8Array(12));
		return window.crypto.subtle.encrypt(
			{name: symmetricOptions.name, iv: iv},
			ephemeral,
			message
		).then(function(ciphertext) {
			return window.crypto.subtle.wrapKey(
				"raw",
				ephemeral,
				publicKey,
				asymmetricOptions
			).then(function (cipherkey) {
				return Promise.resolve({
					iv: iv,
					key: new Uint8Array(cipherkey),
					data: new Uint8Array(ciphertext)
				});
			});
		});
	});
}

function decrypt(o, secretKey) {
	return window.crypto.subtle.unwrapKey(
		"raw",
		o.key,
		secretKey,
		asymmetricOptions,
		symmetricOptions,
		false,
		["encrypt", "decrypt"]
	).then(function (ephemeral) {
		return window.crypto.subtle.decrypt(
			{name: symmetricOptions.name, iv: o.iv},
			ephemeral,
			o.data
		).then(function (buf) {
			return new Uint8Array(buf);
		});
	});
}

function exportMessage(o) {
	return JSON.stringify({
		iv: toBase64(o.iv),
		key: toBase64(o.key),
		data: toBase64(o.data)
	});
}

function importMessage(s) {
	let o = JSON.parse(s);
	return {
		iv: new Uint8Array(fromBase64(o.iv)),
		key: new Uint8Array(fromBase64(o.key)),
		data: new Uint8Array(fromBase64(o.data))
	};
}

function exportKey(k) {
	return window.crypto.subtle.exportKey("jwk", k);
}

function importKey(k, exportable, operations) {
	return window.crypto.subtle.importKey(
		"jwk",
		k,
		asymmetricOptions,
		exportable,
		operations
	);
}
