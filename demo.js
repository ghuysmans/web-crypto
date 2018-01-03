"use strict";

function try_(p) {
	return p.catch(function (e) {
		console.error(e);
	});
}


var f = document.getElementById("f");
var ls = window.localStorage;

var keyPair =
	ls["public"] ?
		importKey(JSON.parse(ls["public"]), true, ["wrapKey"]).
		then(function (pub) {
			return importKey(JSON.parse(ls["private"]), false, ["unwrapKey"]).
			then(function (priv) {
				return Promise.resolve({publicKey: pub, privateKey: priv});
			});
		})
	/* else */ :
		generateKeyPair(2048, true, ["wrapKey", "unwrapKey"]).
		then(function (pair) {
			return exportKey(pair.privateKey).then(function (priv) {
				ls["private"] = JSON.stringify(priv);
				return exportKey(pair.publicKey).then(function (pub) {
					ls["public"] = JSON.stringify(pub);
					return Promise.resolve(pair);
				});
			});
		});

keyPair.then(function (dest) {
	exportKey(dest.publicKey).then(function (pub) {
		let s = JSON.stringify(pub);
		f.public.value = s;
		document.getElementById("link").href = "#" + encodeURIComponent(s);
		let pos = location.href.indexOf("#");
		f.rcpt.value =
			pos != -1 ?
				decodeURIComponent(location.href.substr(pos + 1))
			/* else */ :
				s;
	});
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
