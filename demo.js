"use strict";

function dump(p, dest) {
	p.then(function (v) {
		document.getElementById(dest).value = JSON.stringify(v);
	});
}

function try_(p) {
	return p.catch(function (e) {
		console.error(e);
	});
}


var f = document.getElementById("f");
//if (f.dir[0].checked)

generateKeyPair(2048, true, ["wrapKey", "unwrapKey"]).then(function (dest) {
	dump(exportKey(dest.publicKey), "public");
	dump(exportKey(dest.publicKey), "rcpt");
	dump(exportKey(dest.privateKey), "secret");
	f.d.onclick = function () {
		let message = importMessage(f.ciphertext.value);
		try_(decrypt(message, dest.privateKey).then(function (arr) {
			f.message.value = new TextDecoder("utf-8").decode(arr);
		}));
	};
});

f.e.onclick = function () {
	try_(importKey(
		JSON.parse(f.rcpt.value),
		false,
		["wrapKey"]
	).then(function (publicKey) {
		let arr = new TextEncoder("utf-8").encode(f.message.value);
		return encrypt(publicKey, arr).then(function (o) {
			f.ciphertext.value = exportMessage(o);
		});
	}));
};
