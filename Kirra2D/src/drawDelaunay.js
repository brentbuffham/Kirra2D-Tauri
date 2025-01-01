//to import these funtions into another file use:
//import {drawDelauanyBurdenRelief, drawDelauanySlopeMap, drawReliefLegend, drawTriangleAngleText, drawTriangleBurdenReliefText, drawDirectionArrow, drawLegend} from './drawDelaunay.js';
import { selectedPoint, ctx, kadPointsMap, kadCirclesMap, kadPolygonsMap, kadTextsMap, kadLinesMap } from "./kirra.js";
import { centroidX, centroidY, centroidZ, currentScale, currentFontSize, toeSizeInMeters } from "./kirra.js";
import { calculateTriangleCentroid, getBurdenRelief, getAngleBetweenEdges, getDipAngle, getEdgeSlopeAngle, getAngleBetweenPoints } from "./mathHelpers.js";
import { drawText } from "./drawGeneral.js";

export function drawDelauanyBurdenRelief(triangles, centroid, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.lineWidth = 1;
	//console.log("drawDelauanyBurdenRelief: " + triangles.length);
	// const reliefResults = delaunayContourBurdenRelief(triangles, 20, 0);
	// console.log("Relief Results:", reliefResults);
	for (let i = 0; i < triangles.length; i++) {
		const triangle = triangles[i];
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

		// Color mapping based on timing relief (adjust values as needed)
		let triangleFillColour;
		if (burdenRelief < 4) {
			triangleFillColour = "rgb(75, 20, 20)"; // fast
		} else if (burdenRelief < 7) {
			triangleFillColour = "rgb(255, 40, 40)";
		} else if (burdenRelief < 10) {
			triangleFillColour = "rgb(255, 120, 50)"; //
		} else if (burdenRelief < 13) {
			triangleFillColour = "rgb(255, 255, 50)"; //
		} else if (burdenRelief < 16) {
			triangleFillColour = "rgb(50, 255, 70)"; //
		} else if (burdenRelief < 19) {
			triangleFillColour = "rgb(50, 255, 200)"; //
		} else if (burdenRelief < 22) {
			triangleFillColour = "rgb(50, 230, 255)"; //
		} else if (burdenRelief < 25) {
			triangleFillColour = "rgb(50, 180, 255)"; //
		} else if (burdenRelief < 30) {
			triangleFillColour = "rgb(50, 100, 255)"; //
		} else if (burdenRelief < 40) {
			triangleFillColour = "rgb(50, 0, 255)"; //
		} else {
			triangleFillColour = "rgb(75, 0, 150)"; // slow
		}

		ctx.fillStyle = triangleFillColour;

		// Draw triangle
		const aAX = (tAX - centroid.x) * currentScale + canvas.width / 2;
		const aAY = (-tAY + centroid.y) * currentScale + canvas.height / 2;
		const aBX = (tBX - centroid.x) * currentScale + canvas.width / 2;
		const aBY = (-tBY + centroid.y) * currentScale + canvas.height / 2;
		const aCX = (tCX - centroid.x) * currentScale + canvas.width / 2;
		const aCY = (-tCY + centroid.y) * currentScale + canvas.height / 2;

		ctx.beginPath();
		ctx.moveTo(aAX, aAY);
		ctx.lineTo(aBX, aBY);
		ctx.lineTo(aCX, aCY);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}
}

export function drawDelauanySlopeMap(triangles, centroid, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.fillStyle = "darkgrey";
	ctx.lineWidth = 1;
	console.log("drawDelauanySlopeMap: " + triangles.length);
	for (let i = 0; i < triangles.length; i++) {
		const triangle = triangles[i];
		const tAX = triangle[0][0];
		const tAY = triangle[0][1];
		const tAZ = triangle[0][2];
		const tBX = triangle[1][0];
		const tBY = triangle[1][1];
		const tBZ = triangle[1][2];
		const tCX = triangle[2][0];
		const tCY = triangle[2][1];
		const tCZ = triangle[2][2];

		const edge1 = {
			x: tBX - tAX,
			y: tBY - tAY,
			z: tBZ - tAZ
		};
		const edge2 = {
			x: tCX - tAX,
			y: tCY - tAY,
			z: tCZ - tAZ
		};
		const edge3 = {
			x: tCX - tBX,
			y: tCY - tBY,
			z: tCZ - tBZ
		};

		// Calculate the maximum absolute slope angle for this triangle
		//const slopeAngles = [Math.abs(getEdgeSlopeAngle(triangle[0], triangle[1])), Math.abs(getEdgeSlopeAngle(triangle[1], triangle[2])), Math.abs(getEdgeSlopeAngle(triangle[2], triangle[0]))];
		//let maxSlopeAngle = Math.max(...slopeAngles);

		let maxSlopeAngle = getDipAngle(triangle);

		// Create a triangle array
		const aAX = (tAX - centroid.x) * currentScale + canvas.width / 2;
		const aAY = (-tAY + centroid.y) * currentScale + canvas.height / 2;
		const aAZ = tAZ;
		const aBX = (tBX - centroid.x) * currentScale + canvas.width / 2;
		const aBY = (-tBY + centroid.y) * currentScale + canvas.height / 2;
		const aBZ = tBZ;
		const aCX = (tCX - centroid.x) * currentScale + canvas.width / 2;
		const aCY = (-tCY + centroid.y) * currentScale + canvas.height / 2;
		const aCZ = tCZ;

		// Define the minimum and maximum RGB values (rgb(50, 50, 50) and rgb(200, 200, 200))
		const minRGB = [225, 225, 225];
		const maxRGB = [100, 100, 100];

		// Calculate the RGB values based on maxSlopeAngle using linear interpolation
		const r = Math.round(minRGB[0] + (maxRGB[0] - minRGB[0]) * (maxSlopeAngle / 50));
		const g = Math.round(minRGB[1] + (maxRGB[1] - minRGB[1]) * (maxSlopeAngle / 50));
		const b = Math.round(minRGB[2] + (maxRGB[2] - minRGB[2]) * (maxSlopeAngle / 50));

		const ir = 255 - Math.round(minRGB[0] + (maxRGB[0] - minRGB[0]) * (maxSlopeAngle / 50));
		const ig = 255 - Math.round(minRGB[1] + (maxRGB[1] - minRGB[1]) * (maxSlopeAngle / 50));
		const ib = 255 - Math.round(minRGB[2] + (maxRGB[2] - minRGB[2]) * (maxSlopeAngle / 50));

		// Define the color ranges and corresponding RGB values
		let triangleFillColour;
		if (maxSlopeAngle >= 0 && maxSlopeAngle < 5) {
			// Cornflower blue for angles in the range [0, 4)
			triangleFillColour = "rgb(51, 139, 255)";
		} else if (maxSlopeAngle >= 5 && maxSlopeAngle < 7) {
			// Green for angles in the range [7, 10]
			triangleFillColour = "rgb(0, 102, 204)";
		} else if (maxSlopeAngle >= 7 && maxSlopeAngle < 9) {
			// Green for angles in the range [7, 10]
			triangleFillColour = "rgb(0, 204, 204)";
		} else if (maxSlopeAngle >= 9 && maxSlopeAngle < 12) {
			// Green for angles in the range [7, 10]
			triangleFillColour = "rgb(102, 204, 0)";
		} else if (maxSlopeAngle >= 12 && maxSlopeAngle < 15) {
			// Green for angles in the range [7, 10]
			triangleFillColour = "rgb(204, 204, 0)";
		} else if (maxSlopeAngle >= 15 && maxSlopeAngle < 17) {
			// Green for angles in the range [7, 10]
			triangleFillColour = "rgb(255, 128, 0)";
		} else if (maxSlopeAngle >= 17 && maxSlopeAngle < 20) {
			// Green for angles in the range [7, 10]
			triangleFillColour = "rgb(255, 0, 0)";
		} else {
			// Default to grey for all other angles
			triangleFillColour = "rgb(153, 0, 76)";
		}

		// Combine the calculated RGB values into the final fill color
		// triangleFillColour = `rgb(${r}, ${g}, ${b})`;
		const triangleStrokeColor = `rgb(${r}, ${g}, ${b})`;
		// Invert the color by subtracting each channel value from 255
		const invertedColour = `rgb(${ir}, ${ig}, ${ib})`;

		ctx.strokeStyle = triangleStrokeColor;
		ctx.fillStyle = triangleFillColour;
		ctx.lineWidth = 1;

		ctx.beginPath();
		ctx.moveTo(aAX, aAY);
		ctx.lineTo(aBX, aBY);
		ctx.lineTo(aCX, aCY);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();

		ctx.lineWidth = 1;
	}
}

export function drawReliefLegend(strokecolour) {
	//draw a legend at the bottom of the screen in the center
	//the legend should be for the drawDelauanyTriangles function

	const legend0to4 = "rgb(75, 20, 20)"; // fast
	const legend4to7 = "rgb(255, 40, 40)";
	const legend7to10 = "rgb(255, 120, 50)"; //
	const legend10to13 = "rgb(255, 255, 50)"; //
	const legend13to16 = "rgb(50, 255, 70)"; //
	const legend16to19 = "rgb(50, 255, 200)"; //
	const legend19to22 = "rgb(50, 230, 255)"; //
	const legend22to25 = "rgb(50, 180, 255)"; //
	const legend25to30 = "rgb(50, 100, 255)"; //
	const legend30to40 = "rgb(50, 0, 255)"; //
	const legend40above = "rgb(75, 0, 150)"; // slow

	//draw the legend
	ctx.beginPath();
	ctx.fill();
	ctx.font = "14px Arial";
	ctx.fillStyle = strokecolour;
	ctx.fillText("Legend Relief", 10, canvas.height / 2 - 70);
	ctx.fillText("0ms/m - 4ms/m", 10, canvas.height / 2 - 40);
	ctx.fillText("4ms/m - 7ms/m", 10, canvas.height / 2 - 10);
	ctx.fillText("7ms/m - 10ms/m", 10, canvas.height / 2 + 20);
	ctx.fillText("10ms/m - 13ms/m", 10, canvas.height / 2 + 50);
	ctx.fillText("13ms/m - 16ms/m", 10, canvas.height / 2 + 80);
	ctx.fillText("16ms/m - 19ms/m", 10, canvas.height / 2 + 110);
	ctx.fillText("19ms/m - 22ms/m", 10, canvas.height / 2 + 140);
	ctx.fillText("22ms/m - 25ms/m", 10, canvas.height / 2 + 170);
	ctx.fillText("25ms/m - 30ms/m", 10, canvas.height / 2 + 200);
	ctx.fillText("30ms/m - 40ms/m", 10, canvas.height / 2 + 230);
	ctx.fillText("40ms/m above", 10, canvas.height / 2 + 260);
	ctx.fillStyle = legend0to4;
	ctx.fillRect(130, canvas.height / 2 - 55, 20, 20);
	ctx.fillStyle = legend4to7;
	ctx.fillRect(130, canvas.height / 2 - 25, 20, 20);
	ctx.fillStyle = legend7to10;
	ctx.fillRect(130, canvas.height / 2 + 5, 20, 20);
	ctx.fillStyle = legend10to13;
	ctx.fillRect(130, canvas.height / 2 + 35, 20, 20);
	ctx.fillStyle = legend13to16;
	ctx.fillRect(130, canvas.height / 2 + 65, 20, 20);
	ctx.fillStyle = legend16to19;
	ctx.fillRect(130, canvas.height / 2 + 95, 20, 20);
	ctx.fillStyle = legend19to22;
	ctx.fillRect(130, canvas.height / 2 + 125, 20, 20);
	ctx.fillStyle = legend22to25;
	ctx.fillRect(130, canvas.height / 2 + 155, 20, 20);
	ctx.fillStyle = legend25to30;
	ctx.fillRect(130, canvas.height / 2 + 185, 20, 20);
	ctx.fillStyle = legend30to40;
	ctx.fillRect(130, canvas.height / 2 + 215, 20, 20);
	ctx.fillStyle = legend40above;
	ctx.fillRect(130, canvas.height / 2 + 245, 20, 20);
	ctx.stroke();
}
export function drawTriangleAngleText(triangle, centroid, strokeColour) {
	const triangleCentroid = calculateTriangleCentroid(triangle);
	let maxSlopeAngle = getDipAngle(triangle);
	drawText((triangleCentroid.x - centroid.x) * currentScale + canvas.width / 2, (-triangleCentroid.y + centroid.y) * currentScale + canvas.height / 2, parseFloat(maxSlopeAngle).toFixed(1), strokeColour);
}

export function drawTriangleBurdenReliefText(triangle, centroid, strokeColour) {
	const triangleCentroid = calculateTriangleCentroid(triangle);
	let burdenRelief = getBurdenRelief(triangle);
	drawText((triangleCentroid.x - centroid.x) * currentScale + canvas.width / 2, (-triangleCentroid.y + centroid.y) * currentScale + canvas.height / 2, parseFloat(burdenRelief).toFixed(1), strokeColour);
}

export function drawDirectionArrow(startX, startY, endX, endY, fillColour, strokeColour, firstMovementSize) {
	firstMovementSize = document.getElementById("firstMovementSlider").value;
	try {
		// Set up the arrow parameters
		var arrowWidth = (firstMovementSize / 4) * currentScale; // Width of the arrowhead
		var arrowLength = 2 * (firstMovementSize / 4) * currentScale; // Length of the arrowhead
		var tailWidth = arrowWidth * 0.7; // Width of the tail (adjust as needed)
		const angle = Math.atan2(endY - startY, endX - startX); // Angle of the arrow

		// Set the stroke and fill colors
		ctx.strokeStyle = strokeColour; // Stroke color (black outline)
		ctx.fillStyle = fillColour; // Fill color (goldenrod)

		// Begin drawing the arrow as a single path
		ctx.beginPath();

		// Move to the start point of the arrow
		ctx.moveTo(startX + (tailWidth / 2) * Math.sin(angle), startY - (tailWidth / 2) * Math.cos(angle)); // Top-left corner of the tail

		// Draw to the end point of the tail (top-right corner)
		ctx.lineTo(endX - arrowLength * Math.cos(angle) + (tailWidth / 2) * Math.sin(angle), endY - arrowLength * Math.sin(angle) - (tailWidth / 2) * Math.cos(angle));

		// Draw the right base of the arrowhead
		ctx.lineTo(endX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle), endY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle));

		// Draw the tip of the arrowhead
		ctx.lineTo(endX, endY);

		// Draw the left base of the arrowhead
		ctx.lineTo(endX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle), endY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle));

		// Draw back to the bottom-right corner of the tail
		ctx.lineTo(endX - arrowLength * Math.cos(angle) - (tailWidth / 2) * Math.sin(angle), endY - arrowLength * Math.sin(angle) + (tailWidth / 2) * Math.cos(angle));

		// Draw to the bottom-left corner of the tail
		ctx.lineTo(startX - (tailWidth / 2) * Math.sin(angle), startY + (tailWidth / 2) * Math.cos(angle));

		ctx.closePath();
		ctx.fill(); // Fill the arrow with color
		ctx.stroke(); // Outline the arrow with a stroke
	} catch (error) {
		console.error("Error while drawing arrow:", error);
	}
}
export function drawLegend(strokecolour) {
	//draw a legend at the bottom of the screen in the center
	//the legend should be for the drawDelauanyTriangles function
	//the legend should display the roundedAngleDip Ranges and there colours
	const legend0to5 = "rgb(51, 139, 255)";
	const legend5to7 = "rgb(0, 102, 204)";
	const legend7to9 = "rgb(0, 204, 204)";
	const legend9to12 = "rgb(102, 204, 0)";
	const legend12to15 = "rgb(204, 204, 0)";
	const legend15to17 = "rgb(255, 128, 0)";
	const legend17to20 = "rgb(255, 0, 0)";
	const legend20above = "rgb(153, 0, 76)";
	//draw the legend
	ctx.beginPath();
	ctx.fill();
	ctx.font = "14px Arial";
	ctx.fillStyle = strokecolour;
	ctx.fillText("Legend Slope", 10, canvas.height / 2 - 70);
	ctx.fillText("0\u00B0-5\u00B0", 10, canvas.height / 2 - 40);
	ctx.fillText("5\u00B0-7\u00B0", 10, canvas.height / 2 - 10);
	ctx.fillText("7\u00B0-9\u00B0", 10, canvas.height / 2 + 20);
	ctx.fillText("9\u00B0-12\u00B0", 10, canvas.height / 2 + 50);
	ctx.fillText("12\u00B0-15\u00B0", 10, canvas.height / 2 + 80);
	ctx.fillText("15\u00B0-17\u00B0", 10, canvas.height / 2 + 110);
	ctx.fillText("17\u00B0-20\u00B0", 10, canvas.height / 2 + 140);
	ctx.fillText("20\u00B0+", 10, canvas.height / 2 + 170);
	ctx.fillStyle = legend0to5;
	ctx.fillRect(60, canvas.height / 2 - 55, 20, 20);
	ctx.fillStyle = legend5to7;
	ctx.fillRect(60, canvas.height / 2 - 25, 20, 20);
	ctx.fillStyle = legend7to9;
	ctx.fillRect(60, canvas.height / 2 + 5, 20, 20);
	ctx.fillStyle = legend9to12;
	ctx.fillRect(60, canvas.height / 2 + 35, 20, 20);
	ctx.fillStyle = legend12to15;
	ctx.fillRect(60, canvas.height / 2 + 65, 20, 20);
	ctx.fillStyle = legend15to17;
	ctx.fillRect(60, canvas.height / 2 + 95, 20, 20);
	ctx.fillStyle = legend17to20;
	ctx.fillRect(60, canvas.height / 2 + 125, 20, 20);
	ctx.fillStyle = legend20above;
	ctx.fillRect(60, canvas.height / 2 + 155, 20, 20);
	ctx.stroke();
}
