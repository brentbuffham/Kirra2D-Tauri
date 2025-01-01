import { drawDelauanyBurdenRelief, drawDelauanySlopeMap, drawReliefLegend, drawTriangleAngleText, drawTriangleBurdenReliefText, drawDirectionArrow, drawLegend } from "./drawDelaunay.js";
import { recalculateContours, delaunayTriangles, delaunayContours, isTriangleValid, simplifyLine } from "./delaunayTools.js";
import { drawKADPoints, drawKADLines, drawKADPolys, drawKADCircles, drawKADTexts, drawTrack, drawText, drawHoleToe, drawHole, drawDummy, drawNoDiameterHole, drawHiHole, drawRightAlignedText } from "./drawGeneral.js";
import { drawArrow, drawArrowDelayText } from "./drawConnectors.js";
import { selectedPoint, ctx, kadPointsMap, kadCirclesMap, kadPolygonsMap, kadTextsMap, kadLinesMap } from "./kirra.js";
import { fillColour, strokeColour, transparentFillColour, textFillColour, depthColour, angleDipColour } from "./kirra.js";
import { centroidX, centroidY, centroidZ, currentScale, currentFontSize } from "./kirra.js";
import { isPlaying, timingWindowHolesSelected, selectedMultipleHoles, firstSelectedHole, secondSelectedHole, selectedHole } from "./kirra.js";
import { isDiameterEditing, isLengthEditing, isAngleEditing, isBearingEditing, isEastingEditing, isNorthingEditing, isElevationEditing, isDeletingHole } from "./kirra.js";
import { isAddingConnector, isAddingMultiConnector } from "./kirra.js";
import { timeChart } from "./chartsUsingPlotly.js";

let contourLines = [];
//let contourLinesArray = [];
//let directionArrows = [];
//let epsilon = 1;
const holeScale = document.getElementById("holeSlider").value;
//const firstMovementScale = document.getElementById("firstMovementSlider").value;
let maxEdgeLength = 15;

export function drawData(points, selectedHole) {
	clearCanvas();
	// Disable image smoothing (anti-aliasing)
	ctx.imageSmoothingEnabled = false;

	if (selectedPoint !== null) {
		const x = (selectedPoint.pointXLocation - centroidX) * currentScale + canvas.width / 2; // adjust x position
		const y = (-selectedPoint.pointYLocation + centroidY) * currentScale + canvas.height / 2; // adjust y position
		drawHiHole(x, y, 10, "rgba(255, 102, 255, 0.3)", "rgba(255, 0, 255, 0.6)");
	}

	// Draw the KAD dataset
	if (kadPointsMap.size > 0) {
		for (const entity of kadPointsMap.values()) {
			for (const pointData of entity.data) {
				const x = (pointData.pointXLocation - centroidX) * currentScale + canvas.width / 2; // adjust x position
				const y = (-pointData.pointYLocation + centroidY) * currentScale + canvas.height / 2; // adjust y position
				const z = pointData.pointZLocation;
				drawKADPoints(x, y, z, pointData.colour);
			}
		}
	}

	// Draw the KAD dataset for lines
	if (kadLinesMap.size > 0) {
		for (const entity of kadLinesMap.values()) {
			for (let i = 0; i < entity.data.length - 1; i++) {
				const sx = (entity.data[i].pointXLocation - centroidX) * currentScale + canvas.width / 2;
				const sy = (-entity.data[i].pointYLocation + centroidY) * currentScale + canvas.height / 2;
				const ex = (entity.data[i + 1].pointXLocation - centroidX) * currentScale + canvas.width / 2;
				const ey = (-entity.data[i + 1].pointYLocation + centroidY) * currentScale + canvas.height / 2;
				const sz = entity.data[i].pointZLocation;
				const ez = entity.data[i + 1].pointZLocation;
				const lineWidth = entity.data[i].lineWidth;
				const colour = entity.data[i].colour;
				drawKADLines(sx, sy, ex, ey, sz, ez, lineWidth, colour);
			}
		}
	}
	// Draw the KAD dataset for polygons
	if (kadPolygonsMap.size > 0) {
		for (const entity of kadPolygonsMap.values()) {
			if (entity.data.length >= 2) {
				// Make sure there are at least 2 points to draw a polygon
				const firstPoint = entity.data[0]; // Get the first point to close the polygon
				let prevX = (firstPoint.pointXLocation - centroidX) * currentScale + canvas.width / 2;
				let prevY = (-firstPoint.pointYLocation + centroidY) * currentScale + canvas.height / 2;
				let prevZ = firstPoint.pointZLocation;

				for (let i = 1; i < entity.data.length; i++) {
					const currentPoint = entity.data[i];
					const x = (currentPoint.pointXLocation - centroidX) * currentScale + canvas.width / 2;
					const y = (-currentPoint.pointYLocation + centroidY) * currentScale + canvas.height / 2;
					const z = currentPoint.pointZLocation;

					drawKADPolys(prevX, prevY, x, y, prevZ, z, currentPoint.lineWidth, currentPoint.colour);

					prevX = x;
					prevY = y;
					prevZ = z;
				}

				// Close the polygon by drawing a line back to the first point
				drawKADPolys(prevX, prevY, (firstPoint.pointXLocation - centroidX) * currentScale + canvas.width / 2, (-firstPoint.pointYLocation + centroidY) * currentScale + canvas.height / 2, prevZ, firstPoint.pointZLocation, firstPoint.lineWidth, firstPoint.colour);
			}
		}
	}
	//draw the KAD dataset for text
	if (kadTextsMap.size > 0) {
		for (const entity of kadTextsMap.values()) {
			for (const pointData of entity.data) {
				const x = (pointData.pointXLocation - centroidX) * currentScale + canvas.width / 2; // adjust x position
				const y = (-pointData.pointYLocation + centroidY) * currentScale + canvas.height / 2; // adjust y position
				const z = pointData.pointZLocation;
				drawKADTexts(x, y, z, pointData.text, pointData.colour);
			}
		}
	}
	//draw the KAD dataset for circles
	if (kadCirclesMap.size > 0) {
		for (const entity of kadCirclesMap.values()) {
			for (const pointData of entity.data) {
				const x = (pointData.pointXLocation - centroidX) * currentScale + canvas.width / 2; // adjust x position
				const y = (-pointData.pointYLocation + centroidY) * currentScale + canvas.height / 2; // adjust y position
				const z = pointData.pointZLocation;

				//draw the circles with the radius in the correct scale ie. 100 = 100m and 1 =1m etc
				drawKADCircles(x, y, z, pointData.radius * currentScale, pointData.lineWidth, pointData.colour);
			}
		}
	}

	/*** DRAW POINTS ***/
	//display toggles
	const holeID_display = document.getElementById("display1").checked; //1
	const holeLen_display = document.getElementById("display2").checked; //2
	const holeDia_display = document.getElementById("display2A").checked; //3
	const holeAng_display = document.getElementById("display3").checked; //4
	const holeDip_display = document.getElementById("display4").checked; //5
	const holeBea_display = document.getElementById("display5").checked; //6
	const connector_display = document.getElementById("display5A").checked; //7
	const delayValue_display = document.getElementById("display6").checked; //8
	const initiationTime_display = document.getElementById("display6A").checked; //9
	//const display7 = document.getElementById("display7").checked; //redundant //10
	//const display7A = document.getElementById("display7A").checked; //redundant  //11
	//const display7B = document.getElementById("display7B").checked; //redundant //12
	const contour_display = document.getElementById("display8").checked; //13
	const slopeMap_display = document.getElementById("display8A").checked; //14
	const burdenRelief_display = document.getElementById("display8B").checked; //15
	const firsMovement_display = document.getElementById("display8C").checked; //16
	const xValue_display = document.getElementById("display9").checked; //17
	const yValue_display = document.getElementById("display10").checked; //18
	const zValue_display = document.getElementById("display11").checked; //19
	const holeType_display = document.getElementById("display12").checked; //20
	const measuredLength_display = document.getElementById("display13").checked; //21
	const measuredMass_display = document.getElementById("display14").checked; //22
	const measuredComment_display = document.getElementById("display15").checked; //23

	// Set the colors dynamically based on the mode
	ctx.fillStyle = fillColour;
	ctx.strokeStyle = strokeColour;
	if (slopeMap_display === true) {
		const centroid = { x: centroidX, y: centroidY };

		const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
		drawDelauanySlopeMap(resultTriangles, centroid, strokeColour);

		for (let i = 0; i < resultTriangles.length; i++) {
			const triangle = resultTriangles[i];
			drawTriangleAngleText(triangle, centroid, strokeColour);
		}
		drawLegend(strokeColour);
	}
	ctx.fillStyle = fillColour;
	ctx.strokeStyle = strokeColour;
	if (burdenRelief_display === true) {
		const centroid = { x: centroidX, y: centroidY };

		const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
		drawDelauanyBurdenRelief(reliefTriangles, centroid, strokeColour);
		//console.log("AfterDrawing Burden Relief", reliefTriangles);
		for (let i = 0; i < reliefTriangles.length; i++) {
			const triangle = reliefTriangles[i];
			drawTriangleBurdenReliefText(triangle, centroid, strokeColour);
		}
		drawReliefLegend(strokeColour);
	}

	if (firsMovement_display === true) {
		const { contourLinesArray, directionArrows } = recalculateContours(points, maxEdgeLength);
		// console.log("Direction Arrows1:", directionArrows);
		for (let i = 0; i < directionArrows.length; i++) {
			// console.log("Direction Arrows2:", directionArrows);
			const arrow = directionArrows[i];
			const startX = (arrow[0] - centroidX) * currentScale + canvas.width / 2;
			const startY = (-arrow[1] + centroidY) * currentScale + canvas.height / 2;
			const endX = (arrow[2] - centroidX) * currentScale + canvas.width / 2;
			const endY = (-arrow[3] + centroidY) * currentScale + canvas.height / 2;
			const colour = arrow[4];
			const strokeColour = arrow[5];
			const arrowScale = arrow[6];
			//console.log("Drawing Arrow:", startX, ", ", startY, ", ", endX, ", ", endY, ", ", colour, ", ", arrowScale);
			//ctx.strokeStyle = colour;
			ctx.lineWidth = 1;
			drawDirectionArrow(startX, startY, endX, endY, colour, strokeColour, arrowScale);
		}
	}

	if (contour_display === true) {
		const { contourLinesArray, directionArrows } = recalculateContours(points, maxEdgeLength);
		// contourLinesArray = calcLines;
		// console.log("Contour Lines Array:", contourLinesArray);
		// NEW CODE - Further performance improvements
		ctx.lineWidth = 3;

		// Move color assignment outside of the loop if possible
		const firstColor = "magenta";
		for (let i = 0; i < contourLinesArray.length; i++) {
			contourLines = contourLinesArray[i];
			////console.log("Drawing Contour Lines\n", contourLines);

			ctx.strokeStyle = firstColor;

			for (let j = 0; j < contourLines.length; j++) {
				const line = contourLines[j];

				const startX = (line[0].x - centroidX) * currentScale + canvas.width / 2;
				const startY = (-line[0].y + centroidY) * currentScale + canvas.height / 2;
				const endX = (line[1].x - centroidX) * currentScale + canvas.width / 2;
				const endY = (-line[1].y + centroidY) * currentScale + canvas.height / 2;

				//Draw the lines
				ctx.beginPath();
				ctx.moveTo(startX, startY);
				ctx.lineTo(endX, endY);
				ctx.stroke();
			}
		}
	}
	if (points !== null) {
		ctx.fillStyle = "red";
		ctx.font = "12px Arial"; // Set the font size to 12pt Roboto-Regular
		ctx.fillText("Holes Displayed: " + points.length, 10, canvas.height - 20);
		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			// ctx.fillStyle = "red";
			// ctx.font = "18px Arial"; // Set the font size to 20px
			// ctx.fillText("Holes Displayed: " + points.length, 10, canvas.height - 20);
			const x = (points[i].startXLocation - centroidX) * currentScale + canvas.width / 2; // adjust x position
			const y = (-points[i].startYLocation + centroidY) * currentScale + canvas.height / 2; // adjust y position
			const lineStartX = x;
			const lineStartY = y;
			const lineEndX = (points[i].endXLocation - centroidX) * currentScale + canvas.width / 2;
			const lineEndY = (centroidY - points[i].endYLocation) * currentScale + canvas.height / 2;

			const toeSizeInMeters = document.getElementById("toeSlider").value;
			const connScale = document.getElementById("connSlider").value;
			ctx.strokeStyle = strokeColour;
			if (points[i].holeAngle > 0) {
				drawTrack(lineStartX, lineStartY, lineEndX, lineEndY, strokeColour);
			}
			// Highlight for the animation
			if (isPlaying && timingWindowHolesSelected != null && timingWindowHolesSelected.find((p) => p.entityName === point.entityName && p.holeID === point.holeID)) {
				const highlightColor = "rgba(255, 150, 0, 0.7)"; // Color for playing animation
				const highlightColor2 = "rgba(200, 200, 0, 0.7)"; // Color for playing animation
				drawHiHole(x, y, 10 + parseInt((point.holeDiameter / 400) * holeScale * currentScale), highlightColor, highlightColor);
				//drawHexagon(x, y, 10 + parseInt(point.holeDiameter / 200 * holeScale * currentScale), highlightColor, highlightColor);
				//drawExplosion(x, y, 10, 10 + parseInt(point.holeDiameter / 150 * holeScale * currentScale), 10 + parseInt(point.holeDiameter / 450 * holeScale * currentScale), highlightColor2, highlightColor);
			}

			// Highlight for timeChart selection
			if (!isPlaying && timingWindowHolesSelected != null && timingWindowHolesSelected.find((p) => p.entityName === point.entityName && p.holeID === point.holeID)) {
				drawHiHole(x, y, 10 + parseInt((point.holeDiameter / 500) * holeScale * currentScale), "red", "red");
			}

			ctx.lineWidth = 1; // Reset stroke width for non-selected holes
			ctx.strokeStyle = strokeColour; // Reset stroke color for non-selected holes
			ctx.font = parseInt(currentFontSize) + "px Arial";
			if (parseFloat(points[i].holeLengthCalculated).toFixed(1) != 0.0) {
				const radiusInPixels = toeSizeInMeters * currentScale;
				drawHoleToe(lineEndX, lineEndY, transparentFillColour, strokeColour, radiusInPixels);
			}
			// Text offset based on hole diameter

			const textOffset = parseInt((point.holeDiameter / 1000) * holeScale * currentScale);
			// Right/Left side of the hole
			const leftSideToe = parseInt(lineEndX) - textOffset;
			const rightSideToe = parseInt(lineEndX) + textOffset;
			const leftSideCollar = parseInt(x) - textOffset;
			const rightSideCollar = parseInt(x) + textOffset;
			// Top / Middle / Bottom of the hole
			const topSideToe = parseInt(lineEndY - textOffset /*- parseInt(currentFontSize / 6)*/);
			const middleSideToe = parseInt(lineEndY + textOffset + parseInt(currentFontSize / 4));
			const bottomSideToe = parseInt(lineEndY + textOffset + parseInt(currentFontSize));
			const topSideCollar = parseInt(y - textOffset /*- parseInt(currentFontSize / 6)*/);
			const middleSideCollar = parseInt(y /*+ textOffset*/ + parseInt(currentFontSize / 2));
			const bottomSideCollar = parseInt(y + textOffset + parseInt(currentFontSize));

			//Right side of the hole
			if (holeID_display === true) {
				drawText(rightSideCollar, topSideCollar, points[i].holeID, textFillColour);
			}
			if (holeDia_display === true) {
				drawText(rightSideCollar, middleSideCollar, parseFloat(points[i].holeDiameter).toFixed(0), "green");
			}
			if (holeLen_display === true) {
				drawText(rightSideCollar, bottomSideCollar, parseFloat(points[i].holeLengthCalculated).toFixed(1), depthColour);
			}
			//Left side of the hole
			if (holeAng_display) {
				drawRightAlignedText(leftSideCollar, topSideCollar, parseFloat(points[i].holeAngle).toFixed(0), angleDipColour);
			}
			if (holeDip_display) {
				drawRightAlignedText(leftSideToe, topSideToe, 90 - parseFloat(points[i].holeAngle).toFixed(0), angleDipColour);
			}
			if (holeBea_display) {
				drawRightAlignedText(leftSideToe, bottomSideToe, parseFloat(points[i].holeBearing).toFixed(1), "red");
			}
			if (initiationTime_display) {
				drawRightAlignedText(leftSideCollar, middleSideCollar, point.holeTime, "red");
			}
			if (connector_display) {
				const [splitEntityName, splitFromHoleID] = point.fromHoleID.split(":::");
				// Find the fromHole using both splitEntityName and splitFromHoleID
				const fromHole = points.find((point) => point.entityName === splitEntityName && point.holeID === splitFromHoleID);
				const startPoint = fromHole;
				const endPoint = points.find((point) => point === points[i]);

				if (startPoint && endPoint) {
					const startX = (startPoint.startXLocation - centroidX) * currentScale + canvas.width / 2;
					const startY = (-startPoint.startYLocation + centroidY) * currentScale + canvas.height / 2;
					const endX = (endPoint.startXLocation - centroidX) * currentScale + canvas.width / 2;
					const endY = (-endPoint.startYLocation + centroidY) * currentScale + canvas.height / 2;

					const connColour = point.colourHexDecimal;
					try {
						drawArrow(startX, startY, endX, endY, connColour, connScale);
						//console.log(`Arrow drawn from ${fromHole.holeID} to ${point.holeID}`);
					} catch (error) {
						console.error("Error drawing arrow:", error);
					}
				}
				//console.log(points);
			}
			if (delayValue_display) {
				const [splitEntityName, splitFromHoleID] = point.fromHoleID.split(":::");
				// Find the fromHole using both splitEntityName and splitFromHoleID
				const fromHole = points.find((point) => point.entityName === splitEntityName && point.holeID === splitFromHoleID);
				const startPoint = fromHole;
				const endPoint = points.find((point) => point === points[i]);

				if (startPoint && endPoint) {
					const startX = (startPoint.startXLocation - centroidX) * currentScale + canvas.width / 2;
					const startY = (-startPoint.startYLocation + centroidY) * currentScale + canvas.height / 2;
					const endX = (endPoint.startXLocation - centroidX) * currentScale + canvas.width / 2;
					const endY = (-endPoint.startYLocation + centroidY) * currentScale + canvas.height / 2;

					const connColour = point.colourHexDecimal;
					const pointDelay = point.timingDelayMilliseconds;

					drawArrowDelayText(startX, startY, endX, endY, connColour, pointDelay);
				}
			}
			if (xValue_display) {
				drawRightAlignedText(leftSideCollar, topSideCollar, parseFloat(points[i].startXLocation).toFixed(2), textFillColour);
			}
			if (yValue_display) {
				drawRightAlignedText(leftSideCollar, middleSideCollar, parseFloat(points[i].startYLocation).toFixed(2), textFillColour);
			}
			if (zValue_display) {
				drawRightAlignedText(leftSideCollar, bottomSideCollar, parseFloat(points[i].startZLocation).toFixed(2), textFillColour);
			}
			if (holeType_display) {
				drawText(rightSideCollar, middleSideCollar, points[i].holeType, "green");
			}
			if (measuredLength_display) {
				drawRightAlignedText(leftSideCollar, bottomSideToe, points[i].measuredLength, "#FF4400");
			}
			if (measuredMass_display) {
				drawRightAlignedText(leftSideCollar, topSideToe, points[i].measuredMass, "#FF6600");
			}
			if (measuredComment_display) {
				drawText(rightSideCollar, middleSideCollar, points[i].measuredComment, "#FF8800");
			}

			if (selectedHole != null && selectedHole == points[i]) {
				if (firstSelectedHole == null) {
					drawHiHole(x, y, 10 + parseInt((points[i].holeDiameter / 900) * holeScale * currentScale), "rgba(255, 0, 150, 0.2)", "rgba(255, 0, 150, .8)");
					ctx.fillStyle = "rgba(255, 0, 150, .8)";
					ctx.font = "18px Arial"; // Set the font size for the selected hole text
					if (isDiameterEditing || isLengthEditing || isAngleEditing || isBearingEditing || isEastingEditing || isNorthingEditing || isElevationEditing || isDeletingHole) {
						ctx.fillText("Editing Selected Hole: " + selectedHole.holeID + " in: " + selectedHole.entityName, 2, 20);
					} else if (isAddingConnector || isAddingMultiConnector) {
						ctx.fillText("2nd Selected Hole: " + selectedHole.holeID + " in: " + selectedHole.entityName, 2, 20);
					}
				} else {
					drawHiHole(x, y, 10 + parseInt((points[i].holeDiameter / 900) * holeScale * currentScale), "rgba(0, 255, 0, 0.2)", "rgba(0, 190, 0, .8)");
					ctx.fillStyle = "rgba(0, 190, 0, .8)";
					ctx.font = "18px Arial"; // Set the font size for the selected hole text
					ctx.fillText("1st Selected Hole: " + selectedHole.holeID + " in: " + selectedHole.entityName, 2, 20);
				}
				ctx.lineWidth = 1; // Reset stroke width for non-selected holes
				ctx.strokeStyle = strokeColour; // Reset stroke color for non-selected holes
				if (parseFloat(points[i].holeLengthCalculated).toFixed(1) == 0.0) {
					drawDummy(x, y, parseInt(0.2 * holeScale * currentScale), strokeColour);
				} else if (points[i].holeDiameter == 0) {
					drawNoDiameterHole(x, y, 10, strokeColour);
				} else {
					drawHole(x, y, parseInt((points[i].holeDiameter / 1000) * currentScale * holeScale), fillColour, strokeColour);
				}
			} else if (selectedMultipleHoles != null && selectedMultipleHoles.find((p) => p.entityName === point.entityName && p.holeID === point.holeID)) {
				// Highlight for selected holes
				drawHiHole(x, y, 10 + parseInt((points[i].holeDiameter / 900) * holeScale * currentScale), "rgba(255, 0, 150, 0.2)", "rgba(255, 0, 150, .8)");
				ctx.fillText("Editing Selected Holes: " + selectedMultipleHoles.holeID, 2, 20);
				ctx.lineWidth = 1; // Reset stroke width for non-selected holes
				ctx.strokeStyle = strokeColour; // Reset stroke color for non-selected holes
				if (parseFloat(points[i].holeLengthCalculated).toFixed(1) == 0.0) {
					drawDummy(x, y, parseInt(0.2 * holeScale * currentScale), strokeColour);
				} else if (points[i].holeDiameter == 0) {
					drawNoDiameterHole(x, y, 10, strokeColour);
				} else {
					drawHole(x, y, parseInt((points[i].holeDiameter / 1000) * currentScale * holeScale), fillColour, strokeColour);
				}
			} else {
				ctx.lineWidth = 1; // Reset stroke width for non-selected holes
				ctx.strokeStyle = strokeColour; // Reset stroke color for non-selected holes
				if (parseFloat(points[i].holeLengthCalculated).toFixed(1) == 0.0) {
					drawDummy(x, y, parseInt(0.2 * holeScale * currentScale), strokeColour);
				} else if (points[i].holeDiameter == 0) {
					drawNoDiameterHole(x, y, 10, strokeColour);
				} else {
					drawHole(x, y, parseInt((points[i].holeDiameter / 1000) * currentScale * holeScale), fillColour, strokeColour);
				}
			}

			// Update the font slider value and label with the currentFontSize
			fontSlider.value = currentFontSize;
			fontLabel.textContent = "Font Size: " + parseFloat(currentFontSize).toFixed(1) + "px";
		}
	}
}

export function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawMousePosition(ctx, x, y) {
	ctx.strokeStyle = "red";
	ctx.beginPath();
	ctx.rect(x - 7, y - 7, 14, 14);
	ctx.lineWidth = 1;
	ctx.stroke();
}
