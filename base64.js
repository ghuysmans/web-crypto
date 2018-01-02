"use strict";
//adapted from https://stackoverflow.com/a/36046727

//nice for debugging purpose (but that's all!!)
function toDirtyString(u8) {
	//fromCharCode actually produces raw bytes (for each argument)
	return String.fromCharCode.apply(null, u8);
}

function toBase64(u8) {
	return btoa(toDirtyString(u8));
}

function fromBase64(str) {
	return atob(str).split('').map(function (c) {
		//map each single-byte string to a Uint8
		return c.charCodeAt(0);
	});
}
