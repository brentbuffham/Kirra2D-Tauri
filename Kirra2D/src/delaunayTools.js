//delanauyTools.js

import { timeChart } from "./chartsUsingPlotly.js";
import { selectedHole, setHoleTimes } from "./kirra.js";

// To use these methods in another file, use:
// import { recalculateContours, delaunayTriangles, delaunayContours, isTriangleValid, simplifyLine } from "./delaunayTools.js";

const fillColour = document.body.classList.contains("dark-mode") ? "black" : "white";
const maxEdgeLength = 15;
let holeTimes = {};

/**
 * Recalculate Delaunay triangulation and contours
 * @param {Array} points - The array of points with x, y, z coordinates
 * @param {number} maxEdgeLength - The maximum edge length for the Delaunay triangulation
 * @returns {Object} - Contains contourLinesArray and directionArrows
 */
export function recalculateContours(points, maxEdgeLength) {
	// console.log("Recalculating contours using points: ", points, " | maxEdgeLength:", maxEdgeLength);
	try {
		const contourData = [];
		const holeTimes = calculateTimes(points);
		timeChart(holeTimes, points, selectedHole);

		// Prepare contour data
		for (let i = 0; i < holeTimes.length; i++) {
			const [entityName, holeID] = holeTimes[i][0].split(":::");
			const time = holeTimes[i][1];

			const point = points.find((p) => p.entityName === entityName && p.holeID === holeID);

			if (point) {
				contourData.push({
					x: point.startXLocation,
					y: point.startYLocation,
					z: time
				});
			}
		}

		if (contourData.length === 0) {
			throw new Error("No valid contour data points found.");
		}

		const maxHoleTime = Math.max(...contourData.map((point) => point.z));

		// Calculate contour lines and store them in contourLinesArray
		let contourLinesArray = [];
		let directionArrows = [];
		let interval = maxHoleTime < 350 ? 25 : maxHoleTime < 700 ? 100 : 250;
		interval = parseInt(document.getElementById("intervalSlider").value);

		// Iterate over contour levels
		for (let contourLevel = 0; contourLevel <= maxHoleTime; contourLevel += interval) {
			const { contourLines, directionArrows: arrows } = delaunayContours(contourData, contourLevel, maxEdgeLength);
			directionArrows = arrows;
			const epsilon = 1; // Adjust this value to control the level of simplification
			const simplifiedContourLines = contourLines.map((line) => simplifyLine(line, epsilon));
			contourLinesArray.push(simplifiedContourLines);
			//directionArrows.push(directions);

			// console.log("contourLinesArray: ", contourLinesArray);
			// console.log("directionArrows: ", directionArrows);
		}
		// Return both contour lines
		return { contourLinesArray, directionArrows };
	} catch (err) {
		console.error(err);
	}
}

/**
 * Function to generate a Delaunay triangulation from a set of 2D points, and
 * filter out triangles with edges that are longer than a specified maximum edge length.
 * @param {Array} points the set of 2D points to triangulate
 * @param {number} maxEdgeLength the maximum edge length to allow
 * @returns {Array} an array of triangles, where each triangle is an array of 3 points,
 * each point being an array of 3 numbers (x, y, z)
 */
export function delaunayTriangles(points, maxEdgeLength) {
	let resultTriangles = [];
	let reliefTriangles = [];
	try {
		const getX = (point) => parseFloat(point.startXLocation);
		const getY = (point) => parseFloat(point.startYLocation);

		// Construct the Delaunay triangulation object
		const delaunay = Delaunator.from(points, getX, getY);

		// Helper function to calculate the squared distance between two points
		function distanceSquared(p1, p2) {
			const dx = p1[0] - p2[0];
			const dy = p1[1] - p2[1];
			return dx * dx + dy * dy;
		}

		for (let i = 0; i < delaunay.triangles.length; i += 3) {
			const p1Index = delaunay.triangles[i];
			const p2Index = delaunay.triangles[i + 1];
			const p3Index = delaunay.triangles[i + 2];

			const p1 = points[p1Index];
			const p2 = points[p2Index];
			const p3 = points[p3Index];

			// Calculate squared edge lengths
			const edge1Squared = distanceSquared([getX(p1), getY(p1)], [getX(p2), getY(p2)]);
			const edge2Squared = distanceSquared([getX(p2), getY(p2)], [getX(p3), getY(p3)]);
			const edge3Squared = distanceSquared([getX(p3), getY(p3)], [getX(p1), getY(p1)]);

			// Check if all edge lengths are less than or equal to the maxEdgeLength squared
			if (edge1Squared <= maxEdgeLength ** 2 && edge2Squared <= maxEdgeLength ** 2 && edge3Squared <= maxEdgeLength ** 2) {
				// Add the triangle to the result if the condition is met

				resultTriangles.push([
					[getX(p1), getY(p1), p1.startZLocation], // [x, y, z] of point 1
					[getX(p2), getY(p2), p2.startZLocation], // [x, y, z] of point 2
					[getX(p3), getY(p3), p3.startZLocation] // [x, y, z] of point 3
				]);

				reliefTriangles.push([
					[getX(p1), getY(p1), p1.holeTime], // [x, y, z] of point 1
					[getX(p2), getY(p2), p2.holeTime], // [x, y, z] of point 2
					[getX(p3), getY(p3), p3.holeTime] // [x, y, z] of point 3
				]);
			}
		}
		//console.log("Triangles", resultTriangles);
		//console.log("Relief Triangles", reliefTriangles);
		return { resultTriangles, reliefTriangles };
	} catch (err) {
		console.log(err);
	}
}
/**
 * Helper function to check if a triangle is valid based on edge length
 * @param {Array} triangle - An array of 3 points representing a triangle
 * @param {number} maxEdgeLength - Maximum allowed edge length
 * @returns {boolean} - True if the triangle is valid
 */
export function isTriangleValid(triangle, maxEdgeLength) {
	for (let i = 0; i < 3; i++) {
		const p1 = triangle[i];
		const p2 = triangle[(i + 1) % 3];
		const distance = Math.sqrt(Math.pow(p1.startXLocation - p2.startXLocation, 2) + Math.pow(p1.startYLocation - p2.startYLocation, 2));
		if (distance > maxEdgeLength) return false;
	}
	return true;
}

export function simplifyLine(line, epsilon) {
	if (line.length <= 2) return line;

	const firstPoint = line[0];
	const lastPoint = line[line.length - 1];
	const lineDistSq = (lastPoint.x - firstPoint.x) ** 2 + (lastPoint.y - firstPoint.y) ** 2;

	const { maxDist, maxDistPoint } = line.slice(1, -1).reduce(
		(result, point, i) => {
			const distSq = pointToLineDistanceSq(point, firstPoint, lastPoint, lineDistSq);
			if (distSq > result.maxDist) {
				return {
					maxDist: distSq,
					maxDistPoint: {
						index: i + 1,
						point
					}
				};
			}
			return result;
		},
		{
			maxDist: 0,
			maxDistPoint: {
				index: 0,
				point: null
			}
		}
	);

	if (Math.sqrt(maxDist) > epsilon) {
		const left = simplifyLine(line.slice(0, maxDistPoint.index + 1), epsilon);
		const right = simplifyLine(line.slice(maxDistPoint.index), epsilon);

		return left.slice(0, left.length - 1).concat(right);
	} else {
		return [firstPoint, lastPoint];
	}
}

export function pointToLineDistanceSq(point, lineStart, lineEnd, lineDistSq) {
	const t = ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) + (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) / lineDistSq;

	if (t < 0) {
		return (lineStart.x - point.x) ** 2 + (lineStart.y - point.y) ** 2;
	} else if (t > 1) {
		return (lineEnd.x - point.x) ** 2 + (lineEnd.y - point.y) ** 2;
	} else {
		const projX = lineStart.x + t * (lineEnd.x - lineStart.x);
		const projY = lineStart.y + t * (lineEnd.y - lineStart.y);
		return (point.x - projX) ** 2 + (point.y - projY) ** 2;
	}
}

export function interpolate(p1, p2, contourLevel) {
	const t = (contourLevel - p1.z) / (p2.z - p1.z);
	return {
		x: p1.x + t * (p2.x - p1.x),
		y: p1.y + t * (p2.y - p1.y)
	};
}

export function delaunayContourBurdenRelief(contourData, maxEdgeLength, angleOfInitiation) {
	// Filter out points where holeTime is null
	const filteredContourData = contourData.filter((point) => point.holeTime !== null);

	// Compute Delaunay triangulation
	const delaunay = d3.Delaunay.from(filteredContourData.map((point) => [point.x, point.y]));
	const triangles = delaunay.triangles; // Access the triangles property directly

	const reliefResults = [];

	for (let i = 0; i < triangles.length; i += 3) {
		const triangle = [contourData[triangles[i]], contourData[triangles[i + 1]], contourData[triangles[i + 2]]];

		// Find the earliest and latest times
		const earliestTime = Math.min(triangle[0].holeTime, triangle[1].holeTime, triangle[2].holeTime);
		const latestTime = Math.max(triangle[0].holeTime, triangle[1].holeTime, triangle[2].holeTime);

		// Determine the points corresponding to the earliest and latest times
		let p1, p2;
		if (earliestTime === triangle[0].holeTime) {
			p1 = triangle[0];
		} else if (earliestTime === triangle[1].holeTime) {
			p1 = triangle[1];
		} else {
			p1 = triangle[2];
		}

		if (latestTime === triangle[0].holeTime) {
			p2 = triangle[0];
		} else if (latestTime === triangle[1].holeTime) {
			p2 = triangle[1];
		} else {
			p2 = triangle[2];
		}

		// Calculate the horizontal distance between p1 and p2
		const horizontalDistance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

		// Project the distance along the angle of initiation
		const projectedDistance = horizontalDistance / Math.cos(angleOfInitiation * (Math.PI / 180)); // Angle in radians

		// Calculate burden relief
		const timeDifference = latestTime - earliestTime; // Time difference in ms
		const burdenRelief = timeDifference / projectedDistance; // ms/m

		// Store the results
		reliefResults.push({
			triangle: triangle, // The triangle points
			burdenRelief: burdenRelief // Burden relief value
		});
	}

	return reliefResults;
}

export function delaunayContours(contourData, contourLevel, maxEdgeLength) {
	let firstMovementSize = document.getElementById("firstMovementSlider").value;
	// Filter out points where holeTime is null
	const filteredContourData = contourData.filter((point) => point.holeTime !== null);

	// Compute Delaunay triangulation
	const delaunay = d3.Delaunay.from(filteredContourData.map((point) => [point.x, point.y]));
	const triangles = delaunay.triangles; // Access the triangles property directly

	let contourLines = [];
	let directionArrows = []; // Initialize an array to store the arrows

	for (let i = 0; i < triangles.length; i += 3) {
		const contourLine = [];

		const p1 = contourData[triangles[i]];
		const p2 = contourData[triangles[i + 1]];
		const p3 = contourData[triangles[i + 2]];

		// Calculate the centroid of the triangle (average of x, y coordinates)
		const centroidX = (p1.x + p2.x + p3.x) / 3;
		const centroidY = (p1.y + p2.y + p3.y) / 3;

		// Calculate the vector representing the slope (using Z differences)
		// We'll calculate two vectors: p1->p2 and p1->p3 to get a slope direction
		const v1X = p2.x - p1.x;
		const v1Y = p2.y - p1.y;
		const v1Z = p2.z - p1.z; // Time difference between p1 and p2

		const v2X = p3.x - p1.x;
		const v2Y = p3.y - p1.y;
		const v2Z = p3.z - p1.z; // Time difference between p1 and p3

		// Now we calculate the cross product of these two vectors to get the slope normal
		const slopeX = v1Y * v2Z - v1Z * v2Y;
		const slopeY = v1Z * v2X - v1X * v2Z;
		const slopeZ = v1X * v2Y - v1Y * v2X;

		// Normalize the slope vector (we don't care about the Z component for 2D projection)
		const slopeLength = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
		const normSlopeX = slopeX / slopeLength;
		const normSlopeY = slopeY / slopeLength;

		// Calculate the end point for the arrow based on the normalized slope
		const arrowLength = 2; // Arrow length
		const arrowEndX = centroidX - normSlopeX * firstMovementSize;
		const arrowEndY = centroidY - normSlopeY * firstMovementSize;

		// Get the triangle's surface area
		const surfaceArea = Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
		const strokeColour = document.body.classList.contains("dark-mode") ? "white" : "black";

		let arrow = [centroidX, centroidY, arrowEndX, arrowEndY, "goldenrod", strokeColour, firstMovementSize];
		// console.log("Arrow: ", arrow);

		if (surfaceArea > 0.2) {
			// Store the arrow (start at the centroid, end at the calculated slope direction)
			directionArrows.push(arrow);
		}
		// Process the contour lines (unchanged logic)
		for (let j = 0; j < 3; j++) {
			const p1 = contourData[triangles[i + j]];
			const p2 = contourData[triangles[i + ((j + 1) % 3)]];

			// Calculate distance between p1 and p2
			const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

			// If the distance is larger than maxEdgeLength or contourLevel logic doesn't apply, skip
			if (distance <= maxEdgeLength && ((p1.z < contourLevel && p2.z >= contourLevel) || (p1.z >= contourLevel && p2.z < contourLevel))) {
				const point = interpolate(p1, p2, contourLevel);
				contourLine.push(point);
			}
		}

		if (contourLine.length === 2) {
			contourLines.push(contourLine);
		}
	}
	// Return both contour lines and the newly created arrows
	return { contourLines, directionArrows };
}

export function calculateTimes(points) {
	//console.log("Calculating times...");
	try {
		const surfaces = {};

		// Build initial structures for surfaces and hole times
		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			if (point.entityName && point.holeID && !isNaN(point.timingDelayMilliseconds)) {
				const combinedHoleID = `${point.entityName}:::${point.holeID}`;
				const combinedFromHoleID = point.fromHoleID;
				surfaces[combinedFromHoleID + ">=|=<" + combinedHoleID] = {
					time: 0,
					delay: point.timingDelayMilliseconds
				};

				holeTimes[combinedHoleID] = null;
			} else {
				console.log("Invalid point data:", point);
			}
		}

		// Calculate times for each surface
		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			const combinedHoleID = `${point.entityName}:::${point.holeID}`;
			const combinedFromHoleID = point.fromHoleID;
			if (combinedFromHoleID === combinedHoleID) {
				if (holeTimes[combinedHoleID] === null || point.timingDelayMilliseconds < holeTimes[combinedHoleID]) {
					holeTimes[combinedHoleID] = point.timingDelayMilliseconds;
				}
				updateSurfaceTimes(combinedHoleID, point.timingDelayMilliseconds, surfaces, holeTimes);
			}
		}

		// Log the final state of surfaces and holeTimes for debugging
		//console.log("Final Surfaces:", surfaces);
		//console.log("Final Hole Times:", holeTimes);

		// Create a result array from the holeTimes object
		const result = [];
		for (const combinedHoleID in holeTimes) {
			result.push([combinedHoleID, holeTimes[combinedHoleID]]);
		}

		// Update points with hole times
		for (const [combinedHoleID, time] of result) {
			const [entityName, holeID] = combinedHoleID.split(":::");
			const pointIndex = points.findIndex((p) => p.entityName === entityName && p.holeID === holeID);
			if (pointIndex !== -1) {
				points[pointIndex].holeTime = time;
			}
		}
		setHoleTimes(holeTimes);

		return result;
	} catch (err) {
		console.log("Error in calculateTimes:", err);
	}
}

export function updateSurfaceTimes(combinedHoleID, time, surfaces, holeTimes, visited = new Set()) {
	visited.add(combinedHoleID);
	for (const id in surfaces) {
		const [fromHoleID, toHoleID] = id.split(">=|=<");
		if (fromHoleID === combinedHoleID) {
			const surface = surfaces[id];
			const delay = surface.delay;
			if (!isNaN(delay)) {
				const toTime = parseInt(time) + parseInt(delay);
				if (!visited.has(toHoleID) && (toTime < surface.time || surface.time === 0)) {
					surface.time = toTime;
					holeTimes[toHoleID] = toTime;
					updateSurfaceTimes(toHoleID, toTime, surfaces, holeTimes, visited);
				}
			} else {
				console.log("Invalid delay:", delay, "for surface:", id);
			}
		}
	}
	visited.delete(combinedHoleID);
}
