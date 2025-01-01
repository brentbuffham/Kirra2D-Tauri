export function getAngleBetweenEdges(edge1, edge2) {
	const dotProduct = edge1.x * edge2.x + edge1.y * edge2.y + edge1.z * edge2.z;
	const magEdge1 = Math.sqrt(edge1.x * edge1.x + edge1.y * edge1.y + edge1.z * edge1.z);
	const magEdge2 = Math.sqrt(edge2.x * edge2.x + edge2.y * edge2.y + edge2.z * edge2.z);
	const epsilon = 1e-6; // Tolerance for checking if magnitude is close to zero

	if (Math.abs(magEdge1) < epsilon || Math.abs(magEdge2) < epsilon) {
		// Handle the case where either edge is degenerate (magnitude close to zero)
		return 0;
	}

	let angle = Math.acos(dotProduct / (magEdge1 * magEdge2));
	return (angle * 180) / Math.PI;
}

export function getDipAngle(triangle) {
	const edge1 = [triangle[1][0] - triangle[0][0], triangle[1][1] - triangle[0][1], triangle[1][2] - triangle[0][2]];
	const edge2 = [triangle[2][0] - triangle[0][0], triangle[2][1] - triangle[0][1], triangle[2][2] - triangle[0][2]];

	// Calculate the normal vector of the triangle's plane
	const normalVector = [edge1[1] * edge2[2] - edge1[2] * edge2[1], edge1[2] * edge2[0] - edge1[0] * edge2[2], edge1[0] * edge2[1] - edge1[1] * edge2[0]];

	// Calculate the dot product with the vertical direction (0, 0, 1)
	const dotProduct = normalVector[0] * 0 + normalVector[1] * 0 + normalVector[2] * 1;
	const magNormal = Math.sqrt(normalVector[0] ** 2 + normalVector[1] ** 2 + normalVector[2] ** 2);

	const epsilon = 1e-6; // Tolerance for checking if magnitude is close to zero
	if (Math.abs(magNormal) < epsilon) {
		// Handle degenerate case
		return 0;
	}

	const angleRadians = Math.acos(dotProduct / magNormal);
	const angleDegrees = (angleRadians * 180) / Math.PI;

	// Calculate the dip angle between the dot product and the horizontal plane (0 degrees)
	const dipAngle = 180 - angleDegrees;

	return dipAngle;
}

export function getEdgeSlopeAngle(p1, p2) {
	const dx = p2[0] - p1[0];
	const dy = p2[1] - p1[1];
	const dz = p2[2] - p1[2]; // Consider the z-axis difference for vertical deviation
	const slopeAngleRadians = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy));
	const slopeAngleDegrees = (slopeAngleRadians * 180) / Math.PI;
	return slopeAngleDegrees;
}

export function getAngleBetweenPoints(p1, p2) {
	// Calculate the inferred point p3
	const p3 = [p1[0], p1[1], p2[2]];

	// Calculate the edges
	const edge1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
	const edge2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

	// Calculate the angle between the edges
	const angleRadians = Math.acos((edge1[0] * edge2[0] + edge1[1] * edge2[1] + edge1[2] * edge2[2]) / (vectorMagnitude(edge1) * vectorMagnitude(edge2)));

	// Convert the angle to degrees
	const angleDegrees = (angleRadians * 180) / Math.PI;

	return angleDegrees;
}

function vectorMagnitude(vector) {
	return Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2);
}

export function getBurdenRelief(triangle) {
	const tAX = triangle[0][0];
	const tAY = triangle[0][1];
	const tAZ = triangle[0][2];
	const tBX = triangle[1][0];
	const tBY = triangle[1][1];
	const tBZ = triangle[1][2];
	const tCX = triangle[2][0];
	const tCY = triangle[2][1];
	const tCZ = triangle[2][2];
	// Find the earliest and latest times
	const earliestTime = Math.min(tAZ, tBZ, tCZ);
	const latestTime = Math.max(tAZ, tBZ, tCZ);

	// Calculate the time difference
	const timeDifference = latestTime - earliestTime; // ms

	// Determine which points correspond to the earliest and latest times
	let p1, p2;
	if (earliestTime === tAZ) {
		p1 = { x: tAX, y: tAY };
	} else if (earliestTime === tBZ) {
		p1 = { x: tBX, y: tBY };
	} else {
		p1 = { x: tCX, y: tCY };
	}

	if (latestTime === tAZ) {
		p2 = { x: tAX, y: tAY };
	} else if (latestTime === tBZ) {
		p2 = { x: tBX, y: tBY };
	} else {
		p2 = { x: tCX, y: tCY };
	}

	// Calculate the distance between the two points (earliest and latest)
	const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

	// Calculate burden relief in ms/m
	const burdenRelief = timeDifference / distance;

	//console.log("Time Difference (ms):", timeDifference);
	//console.log("Distance (m):", distance);
	//console.log("Burden Relief (ms/m):", burdenRelief);
	return burdenRelief;
}

export function calculateTriangleCentroid(triangle) {
	const tAX = triangle[0][0];
	const tAY = triangle[0][1];
	const tAZ = triangle[0][2];
	const tBX = triangle[1][0];
	const tBY = triangle[1][1];
	const tBZ = triangle[1][2];
	const tCX = triangle[2][0];
	const tCY = triangle[2][1];
	const tCZ = triangle[2][2];

	const triangleCentroid = {
		x: (tAX + tBX + tCX) / 3,
		y: (tAY + tBY + tCY) / 3,
		z: (tAZ + tBZ + tCZ) / 3
	};
	return triangleCentroid;
}
