export function crc32(str) {
	const table = new Uint32Array(256);
	for (let i = 256; i--; ) {
		let tmp = i;
		for (let k = 8; k--; ) {
			tmp = tmp & 1 ? 3988292384 ^ (tmp >>> 1) : tmp >>> 1;
		}
		table[i] = tmp;
	}

	let crc = 0xffffffff; // Initialize with all bits set to 1 (equivalent to -1)
	for (let i = 0, l = str.length; i < l; i++) {
		crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 255];
	}

	// Ensure it's a 32-bit unsigned integer (force it to be positive)
	crc = crc >>> 0;

	// Return the CRC32 as a string
	return crc.toString(10);
}

export function decimalChecksum(str) {
	let checksum = 0;
	for (let i = 0; i < str.length; i++) {
		checksum += str.charCodeAt(i);
	}
	return checksum;
}
export function calculateMD5Checksum(data) {
	const hash = CryptoJS.MD5(data);
	return hash.toString();
}

export function calculateSHA1Checksum(data) {
	const hash = CryptoJS.SHA1(data);
	return hash.toString();
}

export function calculateSHA256Checksum(data) {
	const hash = CryptoJS.SHA256(data);
	return hash.toString();
}
