import { drawDelauanyBurdenRelief, drawDelauanySlopeMap, drawReliefLegend, drawTriangleAngleText, drawTriangleBurdenReliefText, drawDirectionArrow, drawLegend } from "./drawDelaunay.js";
import { drawArrow, drawArrowDelayText } from "./drawConnectors.js";
import { selectedPoint, ctx, kadPointsMap, kadCirclesMap, kadPolygonsMap, kadTextsMap, kadLinesMap } from "./kirra.js";
import { centroidX, centroidY, centroidZ, currentScale, currentFontSize, toeSizeInMeters } from "./kirra.js";

//to import these funtions into another file use:
//import { drawKADPoints, drawKADLines, drawKADPolys, drawKADCircles, drawKADTexts, drawTrack, drawHoleToe, drawHole, drawDummy, drawNoDiameterHole, drawHiHole, drawExplosion } from './drawGeneral.js';

/*** CODE TO DRAW POINTS FROM KAD DATA ***/
export function drawKADPoints(x, y, z, strokeColour) {
	ctx.beginPath();
	ctx.arc(x, y, 2, 0, 2 * Math.PI);
	ctx.strokeStyle = strokeColour;
	ctx.fillStyle = strokeColour;
	ctx.stroke();
	ctx.fill();
}
//Draws an open polyline from the kadLinesArray
export function drawKADLines(sx, sy, ex, ey, sz, ez, lineWidth, strokeColour) {
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.lineTo(ex, ey);
	ctx.strokeStyle = strokeColour;
	ctx.lineWidth = lineWidth;
	ctx.stroke();
}

export function drawKADPolys(sx, sy, ex, ey, sz, ez, lineWidth, strokeColour) {
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.lineTo(ex, ey);
	ctx.strokeStyle = strokeColour;
	ctx.lineWidth = lineWidth;
	ctx.stroke();
	ctx.closePath();
}

//Draws a circle from the kadCirclesArray
export function drawKADCircles(x, y, z, radius, lineWidth, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	//ctx.fillStyle = fillColour;
	//ctx.fill(); // fill the circle with the fill colour
	ctx.lineWidth = lineWidth;
	ctx.stroke(); // draw the circle border with the stroke colour
}
//Draws text from the kadTextsArray
export function drawKADTexts(x, y, z, text, color) {
	ctx.font = parseInt(currentFontSize - 2) + "px Arial";
	ctx.fillStyle = color;

	// Replace "\n" with line breaks
	text = text.replace(/\\n/g, "\n");
	const lines = text.split("\n");

	const lineHeight = parseInt(currentFontSize - 2) + 4;

	lines.forEach((line, index) => {
		if (line.startsWith("=")) {
			try {
				const expression = line.substring(1); // Remove '='
				const calculatedValue = eval(expression);
				ctx.fillText(calculatedValue.toString(), x, y + index * lineHeight);
			} catch (e) {
				ctx.fillText("Error", x, y + index * lineHeight);
			}
		} else {
			ctx.fillText(line, x, y + index * lineHeight);
		}
	});
}

/*** CODE TO DRAW POINTS FROM CSV DATA ***/
export function drawTrack(lineStartX, lineStartY, lineEndX, lineEndY, strokeColour) {
	ctx.beginPath();
	ctx.moveTo(lineStartX, lineStartY);
	ctx.lineTo(lineEndX, lineEndY);
	ctx.strokeStyle = strokeColour;
	ctx.stroke();
}

export function drawHoleToe(x, y, fillColour, strokeColour, radius) {
	ctx.beginPath();
	// Use the toeSizeInMeters directly to set the radius
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = fillColour;
	ctx.strokeStyle = strokeColour;
	ctx.stroke();
	ctx.fill();
}

export function drawHole(x, y, radius, fillColour, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = fillColour;
	ctx.fill(); // fill the circle with the fill colour
	ctx.lineWidth = 2;
	ctx.stroke(); // draw the circle border with the stroke colour
}
//draw an X shape with the intersection of the lines at x,y and the length of the lines being the radius of the drawHole function
export function drawDummy(x, y, radius, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.lineWidth = 2; // Adjust the line width as needed
	ctx.beginPath();
	ctx.moveTo(x - radius, y - radius);
	ctx.lineTo(x + radius, y + radius);
	ctx.moveTo(x - radius, y + radius);
	ctx.lineTo(x + radius, y - radius);
	ctx.stroke();
}
//draw an square shape with the intersection of the lines at x,y and the length of the lines being the radius of the drawHole function
export function drawNoDiameterHole(x, y, sideLength, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.lineWidth = 2; // Adjust the line width as needed
	const halfSide = sideLength / 2;
	ctx.beginPath();
	ctx.moveTo(x - halfSide, y - halfSide);
	ctx.lineTo(x + halfSide, y - halfSide);
	ctx.lineTo(x + halfSide, y + halfSide);
	ctx.lineTo(x - halfSide, y + halfSide);
	ctx.closePath(); // Close the path to form a square
	ctx.stroke();
}

export function drawHiHole(x, y, radius, fillColour, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = fillColour;
	ctx.fill(); // fill the circle with the fill colour
	ctx.lineWidth = 5;
	ctx.stroke(); // draw the circle border with the stroke colour
}

export function drawExplosion(x, y, spikes, outerRadius, innerRadius, colour1, colour2) {
	let rotation = (Math.PI / 2) * 3;
	let step = Math.PI / spikes;
	let start = rotation;

	// Start the drawing path
	ctx.beginPath();
	ctx.moveTo(x, y - outerRadius);
	for (let i = 0; i < spikes; i++) {
		ctx.lineTo(x + Math.cos(start) * outerRadius, y - Math.sin(start) * outerRadius);
		start += step;

		ctx.lineTo(x + Math.cos(start) * innerRadius, y - Math.sin(start) * innerRadius);
		start += step;
	}
	ctx.lineTo(x, y - outerRadius);
	ctx.closePath();
	ctx.lineWidth = 5;
	ctx.strokeStyle = colour1;
	ctx.stroke();
	ctx.fillStyle = colour2;
	ctx.fill();
}

export function drawHexagon(x, y, sideLength, fillColour, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.beginPath();
	const rotationAngleRadians = (Math.PI / 180) * 30;
	for (let i = 0; i < 6; i++) {
		const angle = rotationAngleRadians + (Math.PI / 3) * i;
		const offsetX = sideLength * Math.cos(angle);
		const offsetY = sideLength * Math.sin(angle);

		if (i === 0) {
			ctx.moveTo(x + offsetX, y + offsetY);
		} else {
			ctx.lineTo(x + offsetX, y + offsetY);
		}
	}

	ctx.closePath();
	ctx.fillStyle = fillColour;
	ctx.fill(); // fill the hexagon with the fill colour
	ctx.lineWidth = 5;
	ctx.stroke(); // draw the hexagon border with the stroke colour
}
//Left-align the text
export function drawText(x, y, text, color) {
	ctx.font = parseInt(currentFontSize - 2) + "px Arial";
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
}
// Right-align the text by calculating the text width
export function drawRightAlignedText(x, y, text, color) {
	ctx.font = parseInt(currentFontSize - 2) + "px Arial";
	const textWidth = ctx.measureText(text).width;
	ctx.fillStyle = color;
	// Draw the text at an x position minus the text width for right alignment
	drawText(x - textWidth, y, text, color);
}
