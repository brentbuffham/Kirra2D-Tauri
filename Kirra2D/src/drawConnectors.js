//to use these export functions in another file, use:
//import { drawArrow, drawArrowDelayText } from './drawConnectors.js';
import { selectedPoint, ctx, kadPointsMap, kadCirclesMap, kadPolygonsMap, kadTextsMap, kadLinesMap } from "./kirra.js";
import { centroidX, centroidY, centroidZ, currentScale, currentFontSize, toeSizeInMeters } from "./kirra.js";

export function drawArrowDelayText(startX, startY, endX, endY, color, text) {
	// Calculate the angle of the text and the midpoint of the line
	const angle = Math.atan2(endY - startY, endX - startX);
	const midX = (startX + endX) / 2;
	const midY = (startY + endY) / 2;

	// Save the current canvas state and apply transformations
	ctx.save();
	ctx.translate(midX, midY);
	ctx.rotate(angle);

	// Draw the text along the line
	ctx.fillStyle = color;
	ctx.font = parseInt(currentFontSize - 2) + "px Arial";
	ctx.fillText(text, -currentFontSize, -3);

	// Restore the canvas state
	ctx.restore();
}

export function drawArrow(startX, startY, endX, endY, color, connScale) {
	//console.log(`Drawing arrow from (${startX}, ${startY}) to (${endX}, ${endY}) with color ${color}`);
	try {
		// Set up the arrow parameters
		var arrowWidth = (connScale / 4) * currentScale;
		var arrowLength = 2 * (connScale / 4) * currentScale;

		// Calculate the angle of the line
		const angle = Math.atan2(startX - endX, startY - endY); // Calculate the angle of the line (reversed)

		ctx.strokeStyle = color;
		ctx.fillStyle = color;

		// Draw the line
		ctx.beginPath();
		ctx.moveTo(parseInt(startX), parseInt(startY));
		ctx.lineTo(parseInt(endX), parseInt(endY));
		ctx.lineWidth = 2;
		ctx.stroke();

		// Draw the arrowhead
		if (endX == startX && endY == startY) {
			var size = (connScale / 4) * currentScale; // Change this value to adjust the size of the house shape
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(endX, endY); // Apex of the house
			ctx.lineTo(endX - size / 2, endY + size); // Bottom left corner
			ctx.lineTo(endX - size / 2, endY + 1.5 * size);
			ctx.lineTo(endX + size / 2, endY + 1.5 * size); // Bottom right corner
			ctx.lineTo(endX + size / 2, endY + size); // Bottom right corner
			ctx.closePath(); // Close the shape
			ctx.stroke(); // Draw the outline
		} else {
			ctx.beginPath();
			ctx.moveTo(parseInt(endX), parseInt(endY));
			ctx.lineTo(endX - arrowLength * Math.cos((Math.PI / 2) * 3 - angle) - arrowWidth * Math.sin((Math.PI / 2) * 3 - angle), endY - arrowLength * Math.sin((Math.PI / 2) * 3 - angle) + arrowWidth * Math.cos((Math.PI / 2) * 3 - angle));
			ctx.lineTo(endX - arrowLength * Math.cos((Math.PI / 2) * 3 - angle) + arrowWidth * Math.sin((Math.PI / 2) * 3 - angle), endY - arrowLength * Math.sin((Math.PI / 2) * 3 - angle) - arrowWidth * Math.cos((Math.PI / 2) * 3 - angle));
			ctx.closePath();
			ctx.fill();
		}
	} catch (error) {
		console.error("Error while drawing arrow:", error);
	}
}
