// Description: This file contains the main functions for the Kirra App
// Author: Brent Buffham
// Last Modified: 20240917 @ 2204 AWST

//imports
import SimpleModal from "./modals/simpleModal.js";

const canvas = document.getElementById("canvas");
const padding = 10; // add 10 pixels of padding

// Get the screen size and calculate the dimensions based on the desired ratio
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const canvasWidth = Math.round(screenWidth);
const canvasHeight = Math.round(screenHeight);

const canvasAdjustWidth = 40;
const canvasAdjustHeight = 0.12;
// Set the dimensions of the canvas and its container
canvas.width = document.documentElement.clientWidth - canvasAdjustWidth;
canvas.height = document.documentElement.clientHeight - document.documentElement.clientHeight * canvasAdjustHeight;

const timeChartObject = document.getElementById("timeChart");
//Plotly modebar button change
/* var style = document.createElement("style");
style.innerHTML = `
.modebar-btn, .modebar-group {
  transform: scale(1); /* Adjust the scale to your preference 
}
.modebar {
  flex-direction: column !important;
}`;
document.getElementsByTagName("head")[0].appendChild(style); */

const resizeRight = document.getElementById("resizeHandleRight");
let isResizingRight = false;
const resizeLeft = document.getElementById("resizeHandleLeft");
let isResizingLeft = false;

const ctx = canvas.getContext("2d");
let scale = 5; // adjust the scale to fit the points in the canvas
let fontSize = document.getElementById("fontSlider").value;
let points = [];
let dxfEntities = [];
let countPoints = points.length;
let sumMeters = 0;
let currentScale = scale; // declare a variable to store the current scale
let currentFontSize = fontSize; // declare a variable to store the current fontsize
let toeScale = document.getElementById("toeSlider").value;
let holeScale = document.getElementById("holeSlider").value;
let deltaX = 0;
let deltaY = 0;
let centroidX = 0;
let centroidY = 0;
let centroidZ = 0;
let firstPointInLine = null;
// Variable to store the "fromHole" ID during connector mode
let fromHoleStore = null;
let isAddingConnector = false;
let isAddingMultiConnector = false;
let isAddingHole = false;
let isAddingPattern = false;
let isDeletingHole = false;
let isMovingCanvas = false;
let isDragging = false;
// Function to add a point to the kadPointsMap
let entityName; // Define entityName outside the function to persist between calls
let createNewEntity = true; // Flag to create a new entity
// Variables to store the initial mouse position during canvas movement
let initialMouseX = 0;
let initialMouseY = 0;
let intervalAmount = document.getElementById("intervalSlider").value;
let firstMovementSize = document.getElementById("firstMovementSlider").value;
let connectAmount = document.getElementById("connectSlider").value;
let contourLevel = 0;
let minX;
let minY;
let worldX = null;
let worldY = null;
let contourLines = [];
let contourLinesArray = [];
let directionArrows = [];
let epsilon = 1;
let holeTimes = {};
let deleteRenumberStart = document.getElementById("deleteRenumberStart").value;
let firstSelectedHole = null;
let secondSelectedHole = null;
let selectedHole = null;
let isBlastNameEditing = false;
let isLengthEditing = false;
let isDiameterEditing = false;
let isAngleEditing = false;
let isBearingEditing = false;
let isEastingEditing = false;
let isNorthingEditing = false;
let isElevationEditing = false;
let isDisplayingContours = false;
let isDisplayingSlopeTriangles = false;
let isDisplayingReliefTriangles = false;
let isDisplayingDirectionArrows = false;
let isTypeEditing = false;
let fixToeLocation = false;
//drawing tool booleans
let isDrawingPoint = false;
let isDrawingLine = false;
let isDrawingCircle = false;
let isDrawingPoly = false;
let isDrawingText = false;
//delete tool booleans
let isDeletingPoint = false;
let isDeletingLine = false;
let isDeletingCircle = false;
let isDeletingPoly = false;
let isDeletingText = false;
//modify tool booleans
let isModifyingPoint = false;
let isModifyingCircle = false;
let isModifyingText = false;
//offset tool booleans
let isOffsetLinePoly = false;
//Record Measurements booleans
let isMeasureRecording = false;

//has selected multiple holes
let hasSelectedMultipleHoles = false;
let selectionMode = false; // Selection mode is set to single hole by default

let maxEdgeLength = 15;
let clickedHole; // Declare clickedHole outside the event listener
let timingWindowHolesSelected = [];
let selectedMultipleHoles = [];
let isPlaying = false; // To track whether the animation is playing
let animationInterval; // To store the interval ID for the animation
let playSpeed = 1; // Default play speed
//COLOURS
let noneColour = "rgba(0, 0, 0, 0)";
let darkModeEnabled = document.body.classList.contains("dark-mode");
let transparentFillColour = darkModeEnabled ? "rgba(0, 128, 255, 0.3)" : "rgba(128, 255, 0, 0.3)";
let fillColour = darkModeEnabled ? "lightgrey" : "darkgrey";
let strokeColour = darkModeEnabled ? "white" : "black";
let textFillColour = darkModeEnabled ? "white" : "black";
let depthColour = darkModeEnabled ? "blue" : "cyan";
let angleDipColour = darkModeEnabled ? "darkcyan" : "orange";

//Switches
const addConnectorButton = document.getElementById("addConnectorButton");
const addMultiConnectorButton = document.getElementById("addMultiConnectorButton");
const addPatternSwitch = document.getElementById("addPatternSwitch");
const addHoleSwitch = document.getElementById("addHoleSwitch");
const editAngleSwitch = document.getElementById("editAngleButton");
const editBearingSwitch = document.getElementById("editBearingButton");
const editEastingSwitch = document.getElementById("editEastingButton");
const editNorthingSwitch = document.getElementById("editNorthingButton");
const editElevationSwitch = document.getElementById("editElevationButton");
const editLengthSwitch = document.getElementById("editLengthButton");
const editLengthPopupSwitch = document.getElementById("editLengthPopupButton");
const editHoleTypePopupSwitch = document.getElementById("editHoleTypePopupButton");
const editTypeSwitch = document.getElementById("editHoleTypePopupButton");
const editBlastNameSwitch = document.getElementById("editBlastNameButton");
const editDiameterSwitch = document.getElementById("editDiameterButton");
const deleteHoleSwitch = document.getElementById("deleteHoleSwitch");
const modifyPointSwitch = document.getElementById("modifyPointDraw");
const modifyCircleSwitch = document.getElementById("modifyCircleDraw");
const modifyTextSwitch = document.getElementById("modifyTextDraw");
const offsetLinePolySwitch = document.getElementById("offsetLinePolyDraw");
const selectionModeButton = document.getElementById("selectionModeButton");

// Drawing Switch Event Listeners
const addPointDraw = document.getElementById("addPointDraw");
const addLineDraw = document.getElementById("addLineDraw");
const addCircleDraw = document.getElementById("addCircleDraw");
const addPolyDraw = document.getElementById("addPolyDraw");
const addTextDraw = document.getElementById("addTextDraw");
// Delete Drawing Switch Event Listeners
const deletePointDraw = document.getElementById("deletePointDraw");
const deleteLineDraw = document.getElementById("deleteLineDraw");
const deleteCircleDraw = document.getElementById("deleteCircleDraw");
const deletePolyDraw = document.getElementById("deletePolyDraw");
const deleteTextDraw = document.getElementById("deleteTextDraw");
//Record Measurements Switch Event Listeners
const measuredLengthSwitch = document.getElementById("measuredLengthSwitch");
const measuredMassSwitch = document.getElementById("measuredMassSwitch");
const measuredCommentSwitch = document.getElementById("measuredCommentSwitch");

//switch Options - Do not in clude in switches array
const renumberStartListener = document.getElementById("deleteRenumberStart");
const renumberHoles = document.getElementById("renumberHoles");
let isRenumberingHoles = false;

const switches = [
	addConnectorButton,
	addMultiConnectorButton,
	addPatternSwitch,
	addHoleSwitch,
	editAngleSwitch,
	editBearingSwitch,
	editEastingSwitch,
	editNorthingSwitch,
	editElevationSwitch,
	editLengthSwitch,
	editLengthPopupSwitch,
	editTypeSwitch,
	editBlastNameSwitch,
	editDiameterSwitch,
	deleteHoleSwitch,
	modifyPointSwitch,
	modifyCircleSwitch,
	modifyTextSwitch,
	offsetLinePolySwitch,
	editHoleTypePopupSwitch,
	addPointDraw,
	addLineDraw,
	addCircleDraw,
	addPolyDraw,
	addTextDraw,
	deletePointDraw,
	deleteLineDraw,
	deleteCircleDraw,
	deletePolyDraw,
	deleteTextDraw,
	measuredLengthSwitch,
	measuredMassSwitch,
	measuredCommentSwitch,
	selectionModeButton
];

// Boolean set to False
function setAllBoolsToFalse() {
	isAddingConnector = false;
	isAddingMultiConnector = false;
	isAddingHole = false;
	isAddingPattern = false;
	isDeletingHole = false;
	isMovingCanvas = false;
	isDragging = false;
	isBlastNameEditing = false;
	isLengthEditing = false;
	isDiameterEditing = false;
	isAngleEditing = false;
	isBearingEditing = false;
	isEastingEditing = false;
	isNorthingEditing = false;
	isElevationEditing = false;
	isDisplayingContours = false;
	isDisplayingSlopeTriangles = false;
	isDisplayingReliefTriangles = false;
	isDisplayingDirectionArrows = false;
	isTypeEditing = false;
	isDrawingPoint = false;
	isDrawingLine = false;
	isDrawingCircle = false;
	isDrawingPoly = false;
	isDrawingText = false;
	isDeletingPoint = false;
	isDeletingLine = false;
	isDeletingCircle = false;
	isDeletingPoly = false;
	isDeletingText = false;
	isPlaying = false;
	isModifyingPoint = false;
	isModifyingCircle = false;
	isModifyingText = false;
	isOffsetLinePoly = false;
	isMeasureRecording = false;
	selectionMode = false; //check this
}

// Buttons
document.getElementById("deletePointButton").addEventListener("click", deleteSelectedPoint);
document.getElementById("deleteObjectButton").addEventListener("click", deleteSelectedObject);
document.getElementById("deleteAllButton").addEventListener("click", deleteSelectedAll);
document.getElementById("fileInput").addEventListener("change", handleFileUpload);
document.getElementById("helpButton").addEventListener("click", openHelp);
document.getElementById("zoomInButton").addEventListener("click", zoomIn);
document.getElementById("zoomOutButton").addEventListener("click", zoomOut);
document.getElementById("resetZoomButton").addEventListener("click", resetZoom);
document.getElementById("deleteHoleButton").addEventListener("click", deleteSelectedHole);
document.getElementById("deletePatternButton").addEventListener("click", deleteSelectedPattern);
document.getElementById("deleteAllPatternsButton").addEventListener("click", deleteSelectedAllPatterns);
document.getElementById("clear-canvas-new-button").addEventListener("click", clearCanvasWithNotification);

const option1 = document.getElementById("display1");
const option2 = document.getElementById("display2");
const option2A = document.getElementById("display2A");
const option3 = document.getElementById("display3");
const option4 = document.getElementById("display4");
const option5 = document.getElementById("display5");
const option5A = document.getElementById("display5A");
const option6 = document.getElementById("display6");
const option6A = document.getElementById("display6A");
//const option7 = document.getElementById("display7");
//const option7A = document.getElementById("display7A");
//const option7B = document.getElementById("display7B");
const option8 = document.getElementById("display8");
const option8A = document.getElementById("display8A"); //Slope
const option8B = document.getElementById("display8B"); //Relief
const option8C = document.getElementById("display8C"); //FirstMovements
const option9 = document.getElementById("display9");
const option10 = document.getElementById("display10");
const option11 = document.getElementById("display11");
const option12 = document.getElementById("display12");
const option13 = document.getElementById("display13");
const option14 = document.getElementById("display14");
const option15 = document.getElementById("display15");

// Add event listeners for mouse down, move, and up events
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);
// Add event listeners for touch start, move, and end events
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

//drawing elevation value
const drawingElevation = document.getElementById("drawingElevation");

//Selection Mode
selectionModeButton.addEventListener("change", function () {
	if (this.checked) {
		//set all the other switches to false
		switches.forEach((switchElement) => {
			if (switchElement) {
				switchElement.checked = false;
				console.log("switchElements set to false when turning on: " + switchElement.id);
			}
		});
		selectionModeButton.checked = true;
		selectionMode = true;
		console.log("selectionModeButton.addEventListener checked");
	} else {
		console.log("selectionModeButton.addEventListener unchecked");
		selectionMode = false;
		switches.forEach((switchElement) => {
			if (switchElement) {
				switchElement.checked = false;
				console.log("switchElements set to false when turning off: " + switchElement.id);
			}
		});
		selectionModeButton.checked = false;
		selectedMultipleHoles = [];
		drawData(points, selectedHole);
	}
});
function setSelectionModeToFalse() {
	selectionMode = false;
	selectionModeButton.checked = false;
	selectedMultipleHoles = [];
	timingWindowHolesSelected = [];
	console.log("selectionModeSettings set to false");
}

//Resizing the Navbar on the right
resizeRight.addEventListener("mousedown", function () {
	isResizingRight = true;

	document.addEventListener("mousemove", handleMouseMove);
	document.addEventListener("mouseup", handleMouseUp);
});
//Resizing the Navbar on the left
resizeLeft.addEventListener("mousedown", function () {
	isResizingLeft = true;

	document.addEventListener("mousemove", handleMouseMove);
	document.addEventListener("mouseup", handleMouseUp);
});
renumberHoles.addEventListener("click", function () {
	isRenumberingHoles = this.checked;
});
renumberStartListener.addEventListener("change", function () {
	deleteRenumberStart = parseInt(this.value);
});

measuredLengthSwitch.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isMeasureRecording = true;
		measuredLengthSwitch.checked = true;
		document.getElementById("display13").checked = true; // Set display mode to hole Length
		canvas.addEventListener("click", handleMeasuredLengthClick);
		canvas.addEventListener("touchstart", handleMeasuredLengthClick);
		drawData(points, selectedHole);
	} else {
		isMeasureRecording = false;
		canvas.removeEventListener("click", handleMeasuredLengthClick);
		canvas.removeEventListener("touchstart", handleMeasuredLengthClick);
		measuredMassSwitch.checked = false;
		measuredCommentSwitch.checked = false;
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
});
measuredMassSwitch.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isMeasureRecording = true;
		measuredMassSwitch.checked = true;
		document.getElementById("display14").checked = true; // Set display mode to hole Length
		canvas.addEventListener("click", handleMeasuredMassClick);
		canvas.addEventListener("touchstart", handleMeasuredMassClick);
		drawData(points, selectedHole);
	} else {
		isMeasureRecording = false;
		canvas.removeEventListener("click", handleMeasuredMassClick);
		canvas.removeEventListener("touchstart", handleMeasuredMassClick);
		measuredLengthSwitch.checked = false;
		measuredCommentSwitch.checked = false;
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
});
measuredCommentSwitch.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isMeasureRecording = true;
		measuredCommentSwitch.checked = true;
		document.getElementById("display15").checked = true; // Set display mode to hole Length
		canvas.addEventListener("click", handleMeasuredCommentClick);
		canvas.addEventListener("touchstart", handleMeasuredCommentClick);
		drawData(points, selectedHole);
	} else {
		isMeasureRecording = false;
		canvas.removeEventListener("click", handleMeasuredCommentClick);
		canvas.removeEventListener("touchstart", handleMeasuredCommentClick);
		measuredMassSwitch.checked = false;
		measuredLengthSwitch.checked = false;
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
});

addPointDraw.addEventListener("change", function () {
	if (this.checked) {
		//switches.forEach(switchElement => (switchElement.checked = false));
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setSelectionModeToFalse();
		setAllBoolsToFalse();
		isDrawingPoint = true;
		addPointDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", handleKADPointClick);
		canvas.addEventListener("touchstart", handleKADPointClick);
	} else {
		isDrawingPoint = false;
		canvas.removeEventListener("click", handleKADPointClick);
		canvas.removeEventListener("touchstart", handleKADPointClick);
		createNewEntity = true;
		drawData(points, selectedHole);
	}
});
addLineDraw.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setSelectionModeToFalse();
		setAllBoolsToFalse();
		//bools.forEach(boolElement => (boolElement = false));
		isDrawingLine = true;
		addLineDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", handleKADLineClick);
		canvas.addEventListener("touchstart", handleKADLineClick);
	} else {
		isDrawingLine = false;
		canvas.removeEventListener("click", handleKADLineClick);
		canvas.removeEventListener("touchstart", handleKADLineClick);
		createNewEntity = true;
		drawData(points, selectedHole);
	}
});
addPolyDraw.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isDrawingPoly = true;
		addPolyDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", handleKADPolyClick);
		canvas.addEventListener("touchstart", handleKADPolyClick);
	} else {
		isDrawingPoly = false;
		canvas.removeEventListener("click", handleKADPolyClick);
		canvas.removeEventListener("touchstart", handleKADPolyClick);
		createNewEntity = true;
		drawData(points, selectedHole);
	}
});
addCircleDraw.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isDrawingCircle = true;
		addCircleDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", handleKADCircleClick);
		canvas.addEventListener("touchstart", handleKADCircleClick);
	} else {
		isDrawingCircle = false;
		canvas.removeEventListener("click", handleKADCircleClick);
		canvas.removeEventListener("touchstart", handleKADCircleClick);
		createNewEntity = true;
		drawData(points, selectedHole);
	}
});
addTextDraw.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isDrawingText = true;
		addTextDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", handleKADTextClick);
		canvas.addEventListener("touchstart", handleKADTextClick);
	} else {
		isDrawingText = false;
		canvas.removeEventListener("click", handleKADTextClick);
		canvas.removeEventListener("touchstart", handleKADTextClick);
		createNewEntity = true;
		drawData(points, selectedHole);
	}
});

deletePointDraw.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isDeletingPoint = true;
		deletePointDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", getClickedPoint);
		canvas.addEventListener("touchstart", getClickedPoint);
	} else {
		isDeletingPoint = false;
		canvas.removeEventListener("click", getClickedPoint);
		canvas.removeEventListener("touchstart", getClickedPoint);
		drawData(points, selectedHole);
	}
});
deleteLineDraw.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isDeletingLine = true;
		deleteLineDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", getClickedPoint);
		canvas.addEventListener("touchstart", getClickedPoint);
	} else {
		isDeletingLine = false;
		canvas.removeEventListener("click", getClickedPoint);
		canvas.removeEventListener("touchstart", getClickedPoint);
		drawData(points, selectedHole);
	}
});
deletePolyDraw.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isDeletingPoly = true;
		deletePolyDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", getClickedPoint);
		canvas.addEventListener("touchstart", getClickedPoint);
	} else {
		isDeletingPoly = false;
		canvas.removeEventListener("click", getClickedPoint);
		canvas.removeEventListener("touchstart", getClickedPoint);
		drawData(points, selectedHole);
	}
});
deleteCircleDraw.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isDeletingCircle = true;
		deleteCircleDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", getClickedPoint);
		canvas.addEventListener("touchstart", getClickedPoint);
	} else {
		isDeletingCircle = false;
		canvas.removeEventListener("click", getClickedPoint);
		canvas.removeEventListener("touchstart", getClickedPoint);
		drawData(points, selectedHole);
	}
});
deleteTextDraw.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isDeletingText = true;
		deleteTextDraw.checked = true;
		//Add event listeners
		canvas.addEventListener("click", getClickedPoint);
		canvas.addEventListener("touchstart", getClickedPoint);
	} else {
		isDeletingText = false;
		canvas.removeEventListener("click", getClickedPoint);
		canvas.removeEventListener("touchstart", getClickedPoint);
		drawData(points, selectedHole);
	}
});
// Event listener for the connector switch

addConnectorButton.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		isAddingConnector = true;
		addConnectorButton.checked = true;
		setSelectionModeToFalse();
		document.getElementById("display5A").checked = true; // Set display mode to connectors
		canvas.addEventListener("click", handleConnectorClick);
		canvas.addEventListener("touchstart", handleConnectorClick);
		drawData(points, selectedHole);
	} else {
		isAddingConnector = false;
		canvas.removeEventListener("click", handleConnectorClick);
		canvas.removeEventListener("touchstart", handleConnectorClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
});
addMultiConnectorButton.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		addMultiConnectorButton.checked = true;
		isAddingMultiConnector = true;
		setSelectionModeToFalse();
		document.getElementById("display5A").checked = true; // Set display mode to connectors
		canvas.addEventListener("click", handleConnectorClick);
		canvas.addEventListener("touchstart", handleConnectorClick);
		drawData(points, selectedHole);
	} else {
		isAddingMultiConnector = false;
		canvas.removeEventListener("click", handleConnectorClick);
		canvas.removeEventListener("touchstart", handleConnectorClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
});

// Event listener for the delete switch
deleteHoleSwitch.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		//setSelectionModeToFalse();
		deleteHoleSwitch.checked = true;
		isDeletingHole = true;
		isAddingPattern = false;
		isAddingHole = false;
		document.getElementById("display1").checked = true; // Set display mode to connectors
		canvas.addEventListener("click", handleHoleDeletingClick);
		canvas.addEventListener("touchstart", handleHoleDeletingClick);
		if (points.length > 0) {
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing
		}
		drawData(points, selectedHole);
	} else {
		isDeletingHole = false;
		canvas.removeEventListener("click", handleHoleDeletingClick);
		canvas.removeEventListener("touchstart", handleHoleDeletingClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		if (points.length > 0) {
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing
		}
		drawData(points, selectedHole);
	}
});
// Event listener for the add switch
addHoleSwitch.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		addHoleSwitch.checked = true;
		isAddingHole = true;
		isAddingPattern = false;
		document.getElementById("display1").checked = true; // Set display mode to connectors
		canvas.addEventListener("click", handleHoleAddingClick);
		canvas.addEventListener("touchstart", handleHoleAddingClick);
		const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
		calculateTimes(points);
		const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

		// directionArrows now contains the arrow data for later drawing

		drawData(points, selectedHole);
	} else {
		isAddingHole = false;
		canvas.removeEventListener("click", handleHoleAddingClick);
		canvas.removeEventListener("touchstart", handleHoleAddingClick);
		deleteHoleSwitch.disabled = false;
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		if (points.length > 0) {
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing
		}
		drawData(points, selectedHole);
	}
});
// Event listener for the add pattern switch
addPatternSwitch.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		addPatternSwitch.checked = true;
		isAddingPattern = true;
		isAddingHole = false;
		document.getElementById("display1").checked = true; // Set display mode to connectors
		canvas.addEventListener("click", handlePatternAddingClick);
		canvas.addEventListener("touchstart", handlePatternAddingClick);
		// Initialize points as an empty array if it's null
		if (points === null) {
			points = [];
		}
		if (points.length > 0) {
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing
		}
		drawData(points, selectedHole);
	} else {
		isAddingPattern = false;
		canvas.removeEventListener("click", handlePatternAddingClick);
		canvas.removeEventListener("touchstart", handlePatternAddingClick);
		deleteHoleSwitch.disabled = false;
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		// Initialize points as an empty array if it's null
		if (points === null) {
			points = [];
		}
		if (points.length > 0) {
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing
		}
		drawData(points, selectedHole);
	}
});

editHoleTypePopupSwitch.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		isTypeEditing = true;
		editHoleTypePopupSwitch.checked = true;
		document.getElementById("display12").checked = true; // Set display mode to hole Length
		canvas.addEventListener("click", handleHoleTypeEditClick);
		canvas.addEventListener("touchstart", handleHoleTypeEditClick);
		drawData(points, selectedHole);
	} else {
		isTypeEditing = false;
		canvas.removeEventListener("click", handleHoleTypeEditClick);
		canvas.removeEventListener("touchstart", handleHoleTypeEditClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
});

editBlastNameSwitch.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		editBlastNameSwitch.checked = true;
		isBlastNameEditing = true;

		canvas.addEventListener("click", handleBlastNameClick);
		canvas.addEventListener("touchstart", handleBlastNameClick);
		drawData(points, selectedHole);
	} else {
		isBlastNameEditing = false;
		canvas.removeEventListener("click", handleBlastNameClick);
		canvas.removeEventListener("touchstart", handleBlastNameClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
});

// Event listener for the edit length with dialog
editLengthPopupSwitch.addEventListener("change", function () {
	if (this.checked) {
		switches.forEach((switchElement) => {
			if (switchElement) switchElement.checked = false;
		});
		setAllBoolsToFalse();
		setSelectionModeToFalse();
		editLengthPopupSwitch.checked = true;
		isLengthEditing = true;
		document.getElementById("display2").checked = true; // Set display mode to hole Length
		canvas.addEventListener("click", handleHoleLengthEditClick);
		canvas.addEventListener("touchstart", handleHoleLengthEditClick);
		drawData(points, selectedHole);
	} else {
		isLengthEditing = false;
		canvas.removeEventListener("click", handleHoleLengthEditClick);
		canvas.removeEventListener("touchstart", handleHoleLengthEditClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
});
// Event listener for the edit hole Length switch
editDiameterSwitch.addEventListener("change", function () {
	if (this.checked) {
		isDiameterEditing = true;
		addConnectorButton.checked = false;
		addHoleSwitch.checked = false;
		deleteHoleSwitch.checked = false;
		editLengthPopupSwitch.checked = false;
		editHoleTypePopupSwitch.checked = false;
		isTypeEditing = false;
		document.getElementById("display2A").checked = true; // Set display mode to hole Length
		canvas.addEventListener("click", handleHoleDiameterEditClick);
		canvas.addEventListener("touchstart", handleHoleDiameterEditClick);
		drawData(points, selectedHole);
	} else {
		isDiameterEditing = false;
		canvas.removeEventListener("click", handleHoleDiameterEditClick);
		canvas.removeEventListener("touchstart", handleHoleDiameterEditClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
	// Access the slider element and add an event listener to track changes
	const holeDiameterSlider = document.getElementById("holeDiameterSlider");
	holeDiameterSlider.addEventListener("input", function () {
		if (isDiameterEditing) {
			let newHoleDiameter = parseFloat(holeDiameterSlider.value);
			if (selectedHole) {
				const index = points.findIndex((point) => point === selectedHole);
				if (index !== -1) {
					clickedHole = points[index];
					//console.log("clickedHole - " + "Hole Length : " + newHoleLength + "m");
					holeDiameterLabel.textContent = "Hole Diameter : " + parseFloat(newHoleDiameter).toFixed(0) + "mm";

					// Calculate endXYZ and draw points
					calculateEndXYZ(clickedHole, newHoleDiameter, 7);
					drawData(points, selectedHole);
				}
			}
			if (selectedMultipleHoles != null) {
				selectedMultipleHoles.forEach((hole) => {
					//console.log("clickedHole - " + "Hole Length : " + newHoleLength + "m");
					holeDiameterLabel.textContent = "Hole Diameter : " + parseFloat(newHoleDiameter).toFixed(0) + "mm";

					// Calculate endXYZ and draw points
					calculateEndXYZ(hole, newHoleDiameter, 7);
					drawData(points, selectedHole);
				});
			}
		}
	});
});
// Event listener for the edit hole Length switch
editLengthSwitch.addEventListener("change", function () {
	//console.log("editLengthSwitch");
	if (this.checked) {
		//console.log("editLengthSwitch checked");
		isLengthEditing = true;
		addConnectorButton.checked = false;
		addMultiConnectorButton.checked = false;
		addHoleSwitch.checked = false;
		deleteHoleSwitch.checked = false;
		editLengthPopupSwitch.checked = false;
		editHoleTypePopupSwitch.checked = false;
		document.getElementById("display2").checked = true; // Set display mode to hole Length
		canvas.addEventListener("click", handleHoleLengthEditClick);
		canvas.addEventListener("touchstart", handleHoleLengthEditClick);
		drawData(points, selectedHole);
	} else {
		//console.log("editLengthSwitch unchecked");
		isLengthEditing = false;
		canvas.removeEventListener("click", handleHoleLengthEditClick);
		canvas.removeEventListener("touchstart", handleHoleLengthEditClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
	// Access the slider element and add an event listener to track changes
	const holeLengthSlider = document.getElementById("holeLengthSlider");
	holeLengthSlider.addEventListener("input", function () {
		if (isLengthEditing) {
			let newHoleLength = parseFloat(holeLengthSlider.value);
			if (selectedHole) {
				const index = points.findIndex((point) => point === selectedHole);
				if (index !== -1) {
					clickedHole = points[index];
					//console.log("clickedHole - " + "Hole Length : " + newHoleLength + "m");
					holeLengthLabel.textContent = "Hole Length : " + parseFloat(newHoleLength).toFixed(1) + "m";

					// Calculate endXYZ and draw points
					calculateEndXYZ(clickedHole, newHoleLength, 1);
					drawData(points, selectedHole);
				}
			}
			if (selectedMultipleHoles != null) {
				selectedMultipleHoles.forEach((hole) => {
					//console.log("clickedHole - " + "Hole Length : " + newHoleLength + "m");
					holeLengthLabel.textContent = "Hole Length : " + parseFloat(newHoleLength).toFixed(1) + "m";

					// Calculate endXYZ and draw points
					calculateEndXYZ(hole, newHoleLength, 1);
					drawData(points, selectedHole);
				});
			}
		}
	});
});
// Event listener for the edit hole Angle switch
editAngleSwitch.addEventListener("change", function () {
	//console.log("editAngleSwitch");
	if (this.checked) {
		//console.log("editAngleSwitch checked");
		isAngleEditing = true;
		addConnectorButton.checked = false;
		addMultiConnectorButton.checked = false;
		addHoleSwitch.checked = false;
		deleteHoleSwitch.checked = false;
		editHoleTypePopupSwitch.checked = false;
		editLengthPopupSwitch.checked = false;
		document.getElementById("display3").checked = true; // Set display mode to hole Angle
		canvas.addEventListener("click", handleAngleEditClick);
		canvas.addEventListener("touchstart", handleAngleEditClick);
		drawData(points, selectedHole);
	} else {
		//console.log("editAngleSwitch unchecked");
		isAngleEditing = false;
		canvas.removeEventListener("click", handleAngleEditClick);
		canvas.removeEventListener("touchstart", handleAngleEditClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
	// Access the slider element and add an event listener to track changes
	const holeAngleSlider = document.getElementById("holeAngleSlider");
	holeAngleSlider.addEventListener("input", function () {
		if (isAngleEditing) {
			let newHoleAngle = parseFloat(holeAngleSlider.value);
			if (selectedHole) {
				const index = points.findIndex((point) => point === selectedHole);
				if (index !== -1) {
					clickedHole = points[index];
					//console.log("clickedHole - " + "Hole Angle : " + newHoleAngle + '°');
					holeAngleLabel.textContent = "Hole Angle : " + parseFloat(newHoleAngle).toFixed(0) + "\u00B0";

					// Calculate endXYZ and draw points
					calculateEndXYZ(clickedHole, newHoleAngle, 2);
					drawData(points, selectedHole);
				}
			}
			if (selectedMultipleHoles != null) {
				selectedMultipleHoles.forEach((hole) => {
					//console.log("clickedHole - " + "Hole Angle : " + newHoleAngle + '°');
					holeAngleLabel.textContent = "Hole Angle : " + parseFloat(newHoleAngle).toFixed(0) + "\u00B0";

					// Calculate endXYZ and draw points
					calculateEndXYZ(hole, newHoleAngle, 2);
					drawData(points, selectedHole);
				});
			}
		}
	});
});
// Event listener for the edit hole Bearing switch
editBearingSwitch.addEventListener("change", function () {
	//console.log("editBearingSwitch");
	if (this.checked) {
		addConnectorButton.checked = false;
		addMultiConnectorButton.checked = false;
		addHoleSwitch.checked = false;
		deleteHoleSwitch.checked = false;
		isBearingEditing = true;
		editHoleTypePopupSwitch.checked = false;
		editLengthPopupSwitch.checked = false;
		document.getElementById("display5").checked = true; // Set display mode to hole Bearing
		canvas.addEventListener("click", handleBearingEditClick);
		canvas.addEventListener("touchstart", handleBearingEditClick);
		drawData(points, selectedHole);
	} else {
		//console.log("editBearingSwitch unchecked");
		isBearingEditing = false;
		canvas.removeEventListener("click", handleBearingEditClick);
		canvas.removeEventListener("touchstart", handleBearingEditClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		drawData(points, selectedHole);
	}
	// Access the slider element and add an event listener to track changes
	const holeBearingSlider = document.getElementById("holeBearingSlider");
	holeBearingSlider.addEventListener("input", function () {
		if (isBearingEditing) {
			let newHoleBearing = parseFloat(holeBearingSlider.value);
			if (selectedHole) {
				const index = points.findIndex((point) => point === selectedHole);
				if (index !== -1) {
					clickedHole = points[index];
					//console.log("clickedHole - " + "Hole Bearing : " + newHoleBearing + "\u00B0");
					holeBearingLabel.textContent = "Hole Bearing : " + parseFloat(newHoleBearing).toFixed(1) + "\u00B0";

					// Calculate endXYZ and draw points
					calculateEndXYZ(clickedHole, newHoleBearing, 3);
					drawData(points, selectedHole);
				}
			}
			if (selectedMultipleHoles != null) {
				selectedMultipleHoles.forEach((hole) => {
					//console.log("clickedHole - " + "Hole Bearing : " + newHoleBearing + "\u00B0");
					holeBearingLabel.textContent = "Hole Bearing : " + parseFloat(newHoleBearing).toFixed(1) + "\u00B0";

					// Calculate endXYZ and draw points
					calculateEndXYZ(hole, newHoleBearing, 3);
					drawData(points, selectedHole);
				});
			}
		}
	});
});
/// Event listener for the edit hole Easting switch
editEastingSwitch.addEventListener("change", function () {
	if (this.checked) {
		console.log("editEastingSwitch checked");
		isEastingEditing = true;
		addConnectorButton.checked = false;
		addMultiConnectorButton.checked = false;
		addHoleSwitch.checked = false;
		deleteHoleSwitch.checked = false;
		editHoleTypePopupSwitch.checked = false;
		editLengthPopupSwitch.checked = false;
		document.getElementById("display9").checked = true; // Set display mode to hole Easting
		canvas.addEventListener("click", handleEastingEditClick);
		canvas.addEventListener("touchstart", handleEastingEditClick);
		drawData(points, selectedHole);
	} else {
		console.log("editEastingSwitch unchecked");
		isEastingEditing = false;
		canvas.removeEventListener("click", handleEastingEditClick);
		canvas.removeEventListener("touchstart", handleEastingEditClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		if (points.length > 0) {
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing
		}
		drawData(points, selectedHole);
	}
});
// Access the slider element and add an event listener to track changes
const holeEastingSlider = document.getElementById("holeEastingSlider");
holeEastingSlider.addEventListener("input", function () {
	let newHoleEasting = parseFloat(holeEastingSlider.value);
	holeEastingLabel.textContent = "Hole Easting (X): " + newHoleEasting.toFixed(2) + "mE";

	if (selectedHole) {
		// Update the easting of the individual selected hole
		const index = points.findIndex((point) => point === selectedHole);
		if (fixToeLocation == true) {
			if (index !== -1) {
				points[index].startXLocation = newHoleEasting;
				// Assuming endXLocation should also be updated based on the new easting
				points[index].endXLocation += newHoleEasting - points[index].startXLocation;
				calculateEndXYZ(points[index], points[index].length, 1);
				// Redraw the updated data
				drawData(points, selectedHole);
			}
		} else {
			if (index !== -1) {
				// Calculate the original delta between startXLocation and endXLocation
				let originalDeltaX = points[index].endXLocation - points[index].startXLocation;

				// Update startXLocation
				points[index].startXLocation = newHoleEasting;

				// Update endXLocation based on the new startXLocation and original delta
				points[index].endXLocation = newHoleEasting + originalDeltaX;

				// Redraw the updated data
				drawData(points, selectedHole);
			}
		}
	} else if (selectedMultipleHoles) {
		// Update the easting of multiple selected holes
		let sumEasting = selectedMultipleHoles.reduce((sum, hole) => sum + hole.startXLocation, 0);
		let averageEasting = sumEasting / selectedMultipleHoles.length;
		let eastingDelta = newHoleEasting - averageEasting;

		selectedMultipleHoles.forEach((hole) => {
			hole.startXLocation += eastingDelta;
			// Assuming endXLocation should also be updated based on the new easting
			hole.endXLocation += eastingDelta;
		});

		// Redraw the updated data for multiple holes
		drawData(points, null); // Pass null as the selected hole might not be relevant
	}

	// Recalculate dependent data structures if necessary
	if (points.length > 0) {
		const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
		calculateTimes(points);
		const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

		// directionArrows now contains the arrow data for later drawing
	}
});

/// Event listener for the edit hole Easting switch
editNorthingSwitch.addEventListener("change", function () {
	if (this.checked) {
		console.log("editNorthingSwitch checked");
		isNorthingEditing = true;
		addConnectorButton.checked = false;
		addMultiConnectorButton.checked = false;
		addHoleSwitch.checked = false;
		deleteHoleSwitch.checked = false;
		editHoleTypePopupSwitch.checked = false;
		editLengthPopupSwitch.checked = false;
		document.getElementById("display10").checked = true; // Set display mode to hole Northing
		canvas.addEventListener("click", handleNorthingEditClick);
		canvas.addEventListener("touchstart", handleNorthingEditClick);
		drawData(points, selectedHole);
	} else {
		console.log("editNorthingSwitch unchecked");
		isNorthingEditing = false;
		canvas.removeEventListener("click", handleNorthingEditClick);
		canvas.removeEventListener("touchstart", handleNorthingEditClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		if (points.length > 0) {
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing
		}
		drawData(points, selectedHole);
	}
});

// Access the slider element and add an event listener to track changes
const holeNorthingSlider = document.getElementById("holeNorthingSlider");
holeNorthingSlider.addEventListener("input", function () {
	let newHoleNorthing = parseFloat(holeNorthingSlider.value);
	holeNorthingLabel.textContent = "Hole Northing (Y): " + newHoleNorthing.toFixed(2) + "mN";

	if (selectedHole) {
		// Update the easting of the individual selected hole
		const index = points.findIndex((point) => point === selectedHole);
		if (fixToeLocation == true) {
			if (index !== -1) {
				points[index].startYLocation = newHoleNorthing;
				// Assuming endYLocation should also be updated based on the new easting
				points[index].endYLocation += newHoleNorthing - points[index].startYLocation;
				calculateEndXYZ(points[index], points[index].length, 1);
				// Redraw the updated data
				drawData(points, selectedHole);
			}
		} else {
			if (index !== -1) {
				// Calculate the original delta between startYLocation and endYLocation
				let originalDeltaY = points[index].endYLocation - points[index].startYLocation;

				// Update startYLocation
				points[index].startYLocation = newHoleNorthing;

				// Update endYLocation based on the new startYLocation and original delta
				points[index].endYLocation = newHoleNorthing + originalDeltaY;

				// Redraw the updated data
				drawData(points, selectedHole);
			}
		}
	} else if (selectedMultipleHoles) {
		// Update the northing of multiple selected holes
		let sumNorthing = selectedMultipleHoles.reduce((sum, hole) => sum + hole.startYLocation, 0);
		let averageNorthing = sumNorthing / selectedMultipleHoles.length;
		let northingDelta = newHoleNorthing - averageNorthing;

		selectedMultipleHoles.forEach((hole) => {
			hole.startYLocation += northingDelta;
			// Assuming endYLocation should also be updated based on the new northing
			hole.endYLocation += northingDelta;
		});

		// Redraw the updated data for multiple holes
		drawData(points, null); // Pass null as the selected hole might not be relevant
	}

	// Recalculate dependent data structures if necessary
	if (points.length > 0) {
		const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
		calculateTimes(points);
		const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

		// directionArrows now contains the arrow data for later drawing
	}
});

/// Event listener for the edit hole Elevation switch
editElevationSwitch.addEventListener("change", function () {
	if (this.checked) {
		isElevationEditing = true;
		addConnectorButton.checked = false;
		addMultiConnectorButton.checked = false;
		addHoleSwitch.checked = false;
		deleteHoleSwitch.checked = false;
		editHoleTypePopupSwitch.checked = false;
		editLengthPopupSwitch.checked = false;
		document.getElementById("display11").checked = true; // Set display mode to hole Elevation
		canvas.addEventListener("click", handleElevationEditClick);
		canvas.addEventListener("touchstart", handleElevationEditClick);
		drawData(points, selectedHole);
	} else {
		isElevationEditing = false;
		canvas.removeEventListener("click", handleElevationEditClick);
		canvas.removeEventListener("touchstart", handleElevationEditClick);
		selectedHole = null;
		firstSelectedHole = null;
		secondSelectedHole = null;
		fromHoleStore = null;
		clickedHole = null;
		if (points.length > 0) {
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing
		}
		drawData(points, selectedHole);
	}
});
// Access the slider element and add an event listener to track changes
const holeElevationSlider = document.getElementById("holeElevationSlider");
holeElevationSlider.addEventListener("input", function () {
	let newHoleElevation = parseFloat(holeElevationSlider.value);
	holeElevationLabel.textContent = "Hole Elevation (Z): " + newHoleElevation.toFixed(2) + "m";

	if (selectedHole) {
		// Update the easting of the individual selected hole
		const index = points.findIndex((point) => point === selectedHole);
		if (fixToeLocation == true) {
			if (index !== -1) {
				points[index].startZLocation = newHoleElevation;
				// Assuming endZLocation should also be updated based on the new easting
				points[index].endZLocation += newHoleElevation - points[index].startZLocation;
				calculateEndXYZ(points[index], points[index].length, 1);
				// Redraw the updated data
				drawData(points, selectedHole);
			}
		} else {
			if (index !== -1) {
				// Calculate the original delta between startZLocation and endZLocation
				let originalDeltaZ = points[index].endZLocation - points[index].startZLocation;

				// Update startZLocation
				points[index].startZLocation = newHoleElevation;

				// Update endZLocation based on the new startZLocation and original delta
				points[index].endZLocation = newHoleElevation + originalDeltaZ;

				// Redraw the updated data
				drawData(points, selectedHole);
			}
		}
	} else if (selectedMultipleHoles) {
		// Update the elevation of multiple selected holes
		let sumElevation = selectedMultipleHoles.reduce((sum, hole) => sum + hole.startZLocation, 0);
		let averageElevation = sumElevation / selectedMultipleHoles.length;
		let elevationDelta = newHoleElevation - averageElevation;

		selectedMultipleHoles.forEach((hole) => {
			hole.startZLocation += elevationDelta;
			// Assuming endZLocation should also be updated based on the new elevation
			hole.endZLocation += elevationDelta;
		});

		// Redraw the updated data for multiple holes
		drawData(points, null); // Pass null as the selected hole might not be relevant
	}

	// Recalculate dependent data structures if necessary
	if (points.length > 0) {
		const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
		calculateTimes(points);
		const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

		// directionArrows now contains the arrow data for later drawing
	}
});

function resizeChart() {
	if (Array.isArray(holeTimes)) {
		const newWidth = document.documentElement.clientWidth;
		Plotly.relayout(timeChartObject, {
			width: newWidth
		});
	}
}
// Add event listener for window resize
window.addEventListener("resize", resizeChart);
var acc = document.getElementsByClassName("accordion");
var i;
for (i = 0; i < acc.length; i++) {
	acc[i].addEventListener("click", function () {
		/* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
		this.classList.toggle("active");
		/* Toggle between hiding and showing the active panel */
		var panel = this.nextElementSibling;
		if (panel.style.display === "block") {
			panel.style.display = "none";
		} else {
			panel.style.display = "block";
			resizeChart(); // Call the resizeChart function to adjust the chart layout
			timeChart();
			//Plotly.relayout("timeChart", {
			//	width: newWidthRight - 50
			//});
		}
	});
}

function isIOS() {
	const userAgent = navigator.userAgent.toLowerCase();
	return /iphone|ipad|ipod/.test(userAgent);
}
document.getElementById("saveKAD").addEventListener("click", function () {
	//mapData = [kadHolesMap, kadPointsMap, kadPolygonsMap, kadLinesMap, kadCirclesMap, kadTextsMap];//including holes
	//mapData = [kadPointsMap, kadPolygonsMap, kadLinesMap, kadCirclesMap, kadTextsMap]; //excluding holes
	exportKADFile(mapData);
});
document.getElementById("saveHoles").addEventListener("click", function () {
	if (isIOS()) {
		const csv = convertPointsTo14ColumnCSV();

		// Create a Blob with the CSV data
		const blob = new Blob([csv], {
			type: "text/csv;charset=utf-8"
		});

		// Create a URL for the Blob
		const url = URL.createObjectURL(blob);

		// Create an anchor element with the download link
		const link = document.createElement("a");
		link.href = url;
		link.download = "KIRRA14_" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".csv";
		link.textContent = "Click here to download";

		// Append the link to the document
		document.body.appendChild(link);

		// Programmatically trigger the click event on the link
		link.click();

		// Remove the link from the document
		document.body.removeChild(link);
	} else {
		const csv = convertPointsTo14ColumnCSV();

		// Create an invisible anchor element
		const link = document.createElement("a");
		link.style.display = "none";

		// Set the CSV data as the "href" attribute
		link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);

		// Prompt the user to save the file
		// Name the file "blastingapps_output" with today's date and time
		link.download = "KIRRA14_" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".csv";

		// Append the link to the document
		document.body.appendChild(link);

		// Programmatically trigger the click event on the link
		link.click();

		// Remove the link from the document
		document.body.removeChild(link);
	}
});

//REMOVED SUPERCEDED - NOT USED
/* document.getElementById("saveAs").addEventListener("click", function() {
	if (isIOS()) {
		const csv = convertPointsTo12ColumnCSV();

		// Create a Blob with the CSV data
		const blob = new Blob([csv], {
			type: "text/csv;charset=utf-8"
		});

		// Create a URL for the Blob
		const url = URL.createObjectURL(blob);

		// Create an anchor element with the download link
		const link = document.createElement("a");
		link.href = url;
		link.download = "KIRRA12_" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".csv";
		link.textContent = "Click here to download";

		// Append the link to the document
		document.body.appendChild(link);

		// Programmatically trigger the click event on the link
		link.click();

		// Remove the link from the document
		document.body.removeChild(link);
	} else {
		const csv = convertPointsTo12ColumnCSV();

		// Create an invisible anchor element
		const link = document.createElement("a");
		link.style.display = "none";

		// Set the CSV data as the "href" attribute
		link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);

		// Prompt the user to save the file
		// Name the file "blastingapps_output" with today's date and time
		link.download = "KIRRA12_" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".csv";

		// Append the link to the document
		document.body.appendChild(link);

		// Programmatically trigger the click event on the link
		link.click();

		// Remove the link from the document
		document.body.removeChild(link);
	}
}); */

document.getElementById("saveAll").addEventListener("click", function () {
	if (isIOS()) {
		const csv = convertPointsToAllDataCSV();

		// Create a Blob with the CSV data
		const blob = new Blob([csv], {
			type: "text/csv;charset=utf-8"
		});

		// Create a URL for the Blob
		const url = URL.createObjectURL(blob);

		// Create an anchor element with the download link
		const link = document.createElement("a");
		link.href = url;
		link.download = "KIRRA_ALL_output_" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".csv";
		link.textContent = "Click here to download";

		// Append the link to the document
		document.body.appendChild(link);

		// Programmatically trigger the click event on the link
		link.click();

		// Remove the link from the document
		document.body.removeChild(link);
	} else {
		const csv = convertPointsToAllDataCSV();

		// Create an invisible anchor element
		const link = document.createElement("a");
		link.style.display = "none";

		// Set the CSV data as the "href" attribute
		link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);

		// Prompt the user to save the file
		// Name the file "blastingapps_output" with today's date and time
		link.download = "KIRRA_ALL_output_" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".csv";

		// Append the link to the document
		document.body.appendChild(link);

		// Programmatically trigger the click event on the link
		link.click();

		// Remove the link from the document
		document.body.removeChild(link);
	}
});
document.getElementById("saveIREDES").addEventListener("click", function () {
	saveIREDESPopup();
});
document.getElementById("saveAQM").addEventListener("click", function () {
	saveAQMPopup();
});
document.getElementById("saveMeasures").addEventListener("click", function () {
	if (isIOS()) {
		const csv = convertPointsToActualDataCSV();

		// Create a Blob with the CSV data
		const blob = new Blob([csv], {
			type: "text/csv;charset=utf-8"
		});

		// Create a URL for the Blob
		const url = URL.createObjectURL(blob);

		// Create an anchor element with the download link
		const link = document.createElement("a");
		link.href = url;
		link.download = "KIRRA_MEASURED_output_" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".csv";
		link.textContent = "Click here to download";

		// Append the link to the document
		document.body.appendChild(link);

		// Programmatically trigger the click event on the link
		link.click();

		// Remove the link from the document
		document.body.removeChild(link);
	} else {
		const csv = convertPointsToActualDataCSV();

		// Create an invisible anchor element
		const link = document.createElement("a");
		link.style.display = "none";

		// Set the CSV data as the "href" attribute
		link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);

		// Prompt the user to save the file
		// Name the file "blastingapps_output" with today's date and time
		link.download = "KIRRA_MEASURED_output_" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".csv";

		// Append the link to the document
		document.body.appendChild(link);

		// Programmatically trigger the click event on the link
		link.click();

		// Remove the link from the document
		document.body.removeChild(link);
	}
});

// Function to check if the mouse is inside the canvas
function isMouseInside(mouseX, mouseY, canvas) {
	const rect = canvas.getBoundingClientRect(); // Get the bounding rectangle of the canvas
	return mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;
}
const canvasContainer = document.querySelector(".canvas-container");

canvasContainer.addEventListener(
	"wheel",
	function (event) {
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		const isMouseInsideCanvas = isMouseInside(mouseX, mouseY, canvas);

		if (isMouseInsideCanvas) {
			event.preventDefault();
			const wheelDelta = event.deltaY;

			const zoomFactor = wheelDelta > 0 ? 0.95 : 1.05;

			// Calculate the mouse position in canvas coordinates
			const canvasRect = canvas.getBoundingClientRect();
			const canvasX = mouseX - canvasRect.left;
			const canvasY = mouseY - canvasRect.top;

			// Calculate the center of the canvas
			const centerX = canvasRect.width / 2;
			const centerY = canvasRect.height / 2;
			//make the canvas center the value of 0,0
			//const canvasCenterX = centerX - canvasX;
			//const canvasCenterY = centerY - canvasY;

			// Calculate the delta between the mouse position and the canvas center
			const deltaX = canvasX - centerX;
			const deltaY = canvasY - centerY;
			// Calculate the delta between the mouse position and the canvas center in negative on the left and positive on the right
			// and negative on the top and positive on the bottom
			//const deltaX = canvasCenterX - centerX;
			//const deltaY = canvasCenterY - centerY;

			// Calculate the position offsets from the center of the canvas
			const offsetX = canvasX - canvasRect.width / 2;
			const offsetY = canvasY - canvasRect.height / 2;

			// Calculate the new scale
			currentScale *= zoomFactor;
			currentFontSize *= zoomFactor;

			// Adjust the centroid position based on the offsets and zoom direction
			if (deltaX < 0 && deltaY < 0) {
				// console.log("Delta X: " + deltaX + " Delta Y: " + deltaY);
				// console.log("Upper Left Quadrant: Mouse is above and to the left of the canvas center");
				centroidX -= (offsetX / currentScale) * (1 - zoomFactor);
				centroidY += (offsetY / currentScale) * (1 - zoomFactor);
			} else if (deltaX < 0 && deltaY > 0) {
				// console.log("Delta X: " + deltaX + " Delta Y: " + deltaY);
				// console.log("Lower Left Quadrant: Mouse is below and to the left of the canvas center");
				centroidX -= (offsetX / currentScale) * (1 - zoomFactor);
				centroidY += (offsetY / currentScale) * (1 - zoomFactor);
			} else if (deltaX > 0 && deltaY < 0) {
				// console.log("Delta X: " + deltaX + " Delta Y: " + deltaY);
				// console.log("Upper Right Quadrant: Mouse is above and to the right of the canvas center");
				centroidX -= (offsetX / currentScale) * (1 - zoomFactor);
				centroidY += (offsetY / currentScale) * (1 - zoomFactor);
			} else if (deltaX > 0 && deltaY > 0) {
				// console.log("Delta X: " + deltaX + " Delta Y: " + deltaY);
				// console.log("Lower Right Quadrant: Mouse is below and to the right of the canvas center");
				centroidX -= (offsetX / currentScale) * (1 - zoomFactor);
				centroidY += (offsetY / currentScale) * (1 - zoomFactor);
			} else {
				// console.log("Delta X: " + deltaX + " Delta Y: " + deltaY);
				// console.log("Center: Mouse is in the center region of the canvas");
				centroidX -= (offsetX / currentScale) * (1 - zoomFactor);
				centroidY -= (offsetY / currentScale) * (1 - zoomFactor);
			}

			// Ensure the currentScale does not go below a minimum value
			currentScale = Math.max(currentScale, 0.000001);

			drawData(points, selectedHole);
		}
	},
	{
		passive: false
	}
);

// Access the slider element and add an event listener to track changes
const toeSlider = document.getElementById("toeSlider");
let toeSizeInMeters = parseFloat(toeSlider.value);
toeSlider.addEventListener("input", function () {
	// Calculate the toe size in meters by using the slider value directly
	toeSizeInMeters = parseFloat(this.value);

	// Update the label with the calculated toe size
	toeLabel.textContent = "Toe Size: " + toeSizeInMeters.toFixed(2) + "m";

	// Call the drawData function with the updated toe size in meters
	drawData(points, selectedHole);
});
const holeSlider = document.getElementById("holeSlider");
holeSlider.addEventListener("input", function () {
	////console.log('Slider value:', this.value);
	holeScale = document.getElementById("holeSlider").value;
	holeLabel.textContent = "Hole Adjust : " + parseFloat(holeScale).toFixed(1);
	drawData(points, selectedHole);
});
// Access the slider element and add an event listener to track changes
const connSlider = document.getElementById("connSlider");
let connScale = parseFloat(connSlider.value);
connSlider.addEventListener("input", function () {
	////console.log('Connector value:', this.value);
	connScale = document.getElementById("connSlider").value;
	connLabel.textContent = "Tie Size : " + parseFloat(connScale).toFixed(1);
	drawData(points, selectedHole);
});
const fontSlider = document.getElementById("fontSlider");
fontSlider.addEventListener("input", function () {
	currentFontSize = this.value;
	currentFontSize = document.getElementById("fontSlider").value;
	fontLabel.textContent = "Font Size : " + currentFontSize + "px";
	drawData(points, selectedHole);
});
// Access the slider element and add an event listener to track changes
const intervalSlider = document.getElementById("intervalSlider");
intervalSlider.addEventListener("input", function () {
	intervalAmount = document.getElementById("intervalSlider").value;
	intervalLabel.textContent = "Interval : " + intervalAmount + "ms";
	const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

	// directionArrows now contains the arrow data for later drawing

	drawData(points, selectedHole);
});
// Access the slider element and add an event listener to track changes
const firstMovementSlider = document.getElementById("firstMovementSlider");
firstMovementSlider.addEventListener("input", function () {
	firstMovementSize = document.getElementById("firstMovementSlider").value;
	firstMovementLabel.textContent = "First Movement Size : " + firstMovementSize;
	const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

	// directionArrows now contains the arrow data for later drawing

	drawData(points, selectedHole);
});
// Access the slider element and add an event listener to track changes
const connectSlider = document.getElementById("connectSlider");
connectSlider.addEventListener("input", function () {
	connectAmount = document.getElementById("connectSlider").value;
	connectLabel.textContent = "Connect Distance : " + connectAmount + "m";
});

const timeSlider = document.getElementById("timeRange");
timeSlider.addEventListener("input", function () {
	////console.log('Connector value:', this.value);
	timeRange = document.getElementById("timeRange").value;
	timeRangeLabel.textContent = "Time window :" + timeRange + "ms";
	timeChart();
	Plotly.relayout("timeChart", {
		width: newWidthRight - 50
	});
});
option1.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option2.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option2A.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option3.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option4.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option5.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option5A.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option6.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option6A.addEventListener("change", function () {
	drawData(points, selectedHole);
});
/*option7.addEventListener("change", function() {
	drawData(points, selectedHole);
});
option7A.addEventListener("change", function() {
	drawData(points, selectedHole);
});
option7B.addEventListener("change", function() {
	drawData(points, selectedHole);
});
*/
option8.addEventListener("change", function () {
	isDisplayingContours = true;
	drawData(points, selectedHole);
});
option8A.addEventListener("change", function () {
	isDisplayingSlopeTriangles = true;
	drawData(points, selectedHole);
});
option8B.addEventListener("change", function () {
	isDisplayingReliefTriangles = true;
	drawData(points, selectedHole);
});
option8C.addEventListener("change", function () {
	isDisplayingDirectionArrows = true;
	drawData(points, selectedHole);
});
option9.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option10.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option11.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option12.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option13.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option14.addEventListener("change", function () {
	drawData(points, selectedHole);
});
option15.addEventListener("change", function () {
	drawData(points, selectedHole);
});
let touchStartTime;
let touchDuration;
const longPressDuration = 200; // Adjust this duration as needed
let isTouchDragging = false;
let longPressTimeout;

function handleMouseDown(event) {
	touchStartTime = Date.now();
	touchDuration = 0; // Reset touch duration on touch start

	// Set a timeout to trigger a long press event
	longPressTimeout = setTimeout(() => {
		isDragging = true; // Set isDragging to true after 500ms
	}, longPressDuration);

	// Continue handling the mouse down event as before
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}
let newWidthRight = 350;
let newWidthLeft = 350;

function handleMouseMove(event) {
	if (isDragging) {
		deltaX = event.clientX - lastMouseX;
		deltaY = event.clientY - lastMouseY;
		lastMouseX = event.clientX;
		lastMouseY = event.clientY;
		centroidX -= deltaX / currentScale;
		centroidY += deltaY / currentScale;
		drawData(points, selectedHole);
	}
	if (isResizingRight) {
		newWidthRight = window.innerWidth - event.clientX;
		Plotly.relayout("timeChart", {
			width: newWidthRight - 50
		});
		document.getElementById("sidenavRight").style.width = newWidthRight + "px";
	}
	if (isResizingLeft) {
		newWidthLeft = event.clientX;
		document.getElementById("sidenavLeft").style.width = newWidthLeft + "px";
	}
}

function handleMouseUp(event) {
	isDragging = false;
	clearTimeout(longPressTimeout); // Clear the long press timeout

	//touchDuration = Date.now() - touchStartTime;

	if (isAddingHole && touchDuration <= longPressDuration) {
		// Short click behavior
		touchStartX = event.clientX;
		touchStartY = event.clientY;
		addHolePopup();
	}
	if (isAddingPattern && touchDuration <= longPressDuration) {
		touchStartX = event.clientX;
		touchStartY = event.clientY;
		// Log the values of worldX and worldY
	}
	if (isDrawingPoint && touchDuration <= longPressDuration) {
		touchStartX = event.clientX;
		touchStartY = event.clientY;
		// Log the values of worldX and worldY
	}
	if (isDrawingLine && touchDuration <= longPressDuration) {
		touchStartX = event.clientX;
		touchStartY = event.clientY;
		// Log the values of worldX and worldY
	}
	if (isDrawingPoly && touchDuration <= longPressDuration) {
		touchStartX = event.clientX;
		touchStartY = event.clientY;
		// Log the values of worldX and worldY
	}
	if (isDrawingCircle && touchDuration <= longPressDuration) {
		touchStartX = event.clientX;
		touchStartY = event.clientY;
		// Log the values of worldX and worldY
	}
	if (isDrawingText && touchDuration <= longPressDuration) {
		touchStartX = event.clientX;
		touchStartY = event.clientY;
		// Log the values of worldX and worldY
	}
	isResizingRight = false;
	document.removeEventListener("mousemove", handleMouseMove);
	document.removeEventListener("mouseup", handleMouseUp);
	isResizingLeft = false;
	document.removeEventListener("mousemove", handleMouseMove);
	document.removeEventListener("mouseup", handleMouseUp);
}

// Rest of the code for touch events is unchanged

function handleTouchStart(event) {
	touchStartTime = Date.now();
	touchDuration = 0; // Reset touch duration on touch start

	// Set a timeout to trigger a long press event
	longPressTimeout = setTimeout(() => {
		isTouchDragging = true; // Set isTouchDragging to true after 500ms
	}, longPressDuration);

	// Continue handling the touch start event as before
	if (event.touches.length === 1) {
		isTouchDragging = true;
		touchStartX = event.touches[0].clientX;
		touchStartY = event.touches[0].clientY;
	} else if (event.touches.length === 2) {
		// Pinch
		initialPinchDistance = null;
		initialScale = currentScale;
		initialFontSize = currentFontSize;
	}
}

function handleTouchEnd(event) {
	// Clear the long press timeout
	clearTimeout(longPressTimeout);

	// Only set isTouchDragging to false on touch end
	isTouchDragging = false;

	touchDuration = Date.now() - touchStartTime;
	if (isAddingHole && touchDuration <= longPressDuration) {
		touchStartX = event.changedTouches[0].clientX;
		touchStartY = event.changedTouches[0].clientY;
		addHolePopup();
	}
	if (event.touches.length === 1) {
		initialPinchDistance = null;
		initialScale = currentScale;
		initialFontSize = currentFontSize;
	}
	if (isAddingPattern && touchDuration <= longPressDuration) {
		touchStartX = event.changedTouches[0].clientX;
		touchStartY = event.changedTouches[0].clientY;
	}
	if (isDrawingPoint && touchDuration <= longPressDuration) {
		touchStartX = event.changedTouches[0].clientX;
		touchStartY = event.changedTouches[0].clientY;
	}
	if (isDrawingLine && touchDuration <= longPressDuration) {
		touchStartX = event.changedTouches[0].clientX;
		touchStartY = event.changedTouches[0].clientY;
	}
	if (isDrawingPoly && touchDuration <= longPressDuration) {
		touchStartX = event.changedTouches[0].clientX;
		touchStartY = event.changedTouches[0].clientY;
	}
	if (isDrawingCircle && touchDuration <= longPressDuration) {
		touchStartX = event.changedTouches[0].clientX;
		touchStartY = event.changedTouches[0].clientY;
	}
	if (isDrawingText && touchDuration <= longPressDuration) {
		touchStartX = event.changedTouches[0].clientX;
		touchStartY = event.changedTouches[0].clientY;
	}
}

function handleTouchMove(event) {
	if (event.touches.length === 1 && isTouchDragging) {
		event.preventDefault();
		let touchX = event.touches[0].clientX;
		let touchY = event.touches[0].clientY;
		deltaX = touchX - touchStartX;
		deltaY = touchY - touchStartY;
		touchStartX = touchX;
		touchStartY = touchY;
		centroidX -= deltaX / currentScale;
		centroidY += deltaY / currentScale;
		drawData(points, selectedHole);
	} else if (event.touches.length === 2) {
		event.preventDefault();

		deltaX = event.touches[0].clientX - event.touches[1].clientX;
		deltaY = event.touches[0].clientY - event.touches[1].clientY;
		const currentPinchDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		if (initialPinchDistance === null) {
			initialPinchDistance = currentPinchDistance;
		} else {
			const pinchDelta = currentPinchDistance - initialPinchDistance;
			currentScale = initialScale + pinchDelta * 0.05;
			currentScale = Math.max(currentScale, 0.000001);
			currentFontSize = initialFontSize * (currentScale / initialScale);

			drawData(points, selectedHole);
		}
	}
}

let sessionLoadCount = 0;
let blastNameValue = "BlastName" + sessionLoadCount;

async function handleFileUpload(event) {
	const file = event.target.files[0];
	if (!file) {
		return; // Exit the function if file selection is canceled
	}

	const reader = new FileReader();

	reader.onload = async function (event) {
		const data = event.target.result;
		// Check if the file is a KAD file
		if (file.name.endsWith(".kad") || file.name.endsWith(".KAD") || file.name.endsWith(".txt") || file.name.endsWith(".TXT")) {
			//try {
			parseKADFile(data);
			drawData(points, selectedHole);
		} else if (file.name.endsWith(".csv") || file.name.endsWith(".CSV")) {
			// Handle CSV file parsing
			let correctColumnNumbers = false;
			const lines = data.split("\n");
			for (let i = 0; i < lines.length; i++) {
				const values = lines[i].split(",");
				if (values.length === 14) {
					correctColumnNumbers = true; // CSV has 14 values, no need to ask for blast name
				}
			}
			if (correctColumnNumbers) {
				// If the CSV file has 14 values per row, no need to ask for a blast name
				blastNameValue = "";
			} else {
				// If not, ask the user for a blast name
				result = await editBlastNamePopupAsync();
				blastNameValue = result;
				console.log("Async handle - blastNameValue: ", blastNameValue);
			}
			try {
				// Ensure blastNameValue is set before calling parseCSV
				points = parseCSV(data, blastNameValue);
			} catch (error) {
				console.log("Error: ", error);
				throw error;
			}

			//for (let i = 0; i < points.length; i++) {
			//	points[i].holeTime = null;
			//}
			// Calculate centroid of points

			let sumX = 0;
			let sumY = 0;
			for (let i = 0; i < points.length; i++) {
				sumX += points[i].startXLocation;
				sumY += points[i].startYLocation;
			}

			centroidX = sumX / points.length;
			centroidY = sumY / points.length;
			try {
				const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

				// directionArrows now contains the arrow data for later drawing

				const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
				drawData(points, selectedHole);
				countPoints = points.length;
			} catch (error) {
				fileFormatPopup(error);
			}
		}
	};
	reader.readAsText(file);
}

function parseCSV(data, blastNameValue) {
	sessionLoadCount += 1;
	const lines = data.split("\n");
	let minX = Infinity;
	let minY = Infinity;
	const entityName = blastNameValue;
	const entityType = "hole";

	for (let i = 0; i < lines.length; i++) {
		const values = lines[i].split(",");

		// Skip lines with more than 20 columns
		// if (values.length != 20 || values.length != 14 || values.length != 12 || values.length != 9 || values.length != 7 || values.length != 4) {
		// 	continue;
		// }
		if (values.length > 20) {
			continue;
		}

		if (values.length === 20) {
			// check if it has the correct number of values
			const entityName = values[0];
			const entityType = "hole";
			const holeID = values[2]; //Id of the blast hole
			const startXLocation = parseFloat(values[3]); //start of the blast hole X value
			const startYLocation = parseFloat(values[4]); //start of the blast hole Y value
			const startZLocation = parseFloat(values[5]); //start of the blast hole Z value
			const endXLocation = parseFloat(values[6]); //end of the blast hole X value
			const endYLocation = parseFloat(values[7]); //end of the blast hole Y value
			const endZLocation = parseFloat(values[8]); //end of the blast hole Z value
			const holeDiameter = parseFloat(values[9]); //diameter of the blast hole
			const holeType = values[10]; //type of the blast hole
			const fromHoleID = values[11]; //from hole where the connector tail will be
			const timingDelayMilliseconds = parseInt(values[12]); //delay from hole to Id of the blast
			const colourHexDecimal = values[13].replace(/\r$/, ""); //colour of the delay in HEXDECIMALS
			// Parse optional fields
			const measuredLength = values.length > 14 ? parseFloat(values[14]) : 0;
			const measuredLengthTimeStamp = values.length > 15 ? values[15] : "09/05/1975 00:00:00";
			const measuredMass = values.length > 16 ? parseFloat(values[16]) : 0;
			const measuredMassTimeStamp = values.length > 17 ? values[17] : "09/05/1975 00:00:00";
			const measuredComment = values.length > 18 ? values[18] : "None";
			const measuredCommentTimeStamp = values.length > 19 ? values[19] : "09/05/1975 00:00:00";

			const holeLengthCalculated = Math.pow(Math.pow(startXLocation - endXLocation, 2) + Math.pow(startYLocation - endYLocation, 2) + Math.pow(startZLocation - endZLocation, 2), 0.5); //calc the distance between sx,sy,sz and ex,ey,ez
			const deltaXAmount = endXLocation - startXLocation; // Calculate the differences between the longitude and latitude of the two points
			//console.log("X",deltaXAmount);
			const deltaYAmount = endYLocation - startYLocation; // Calculate the differences between the longitude and latitude of the two points
			//console.log("Y",deltaYAmount);
			const deltaZAmount = endZLocation - startZLocation; // Calculate the differences between the longitude and latitude of the two points
			//console.log("Z",deltaZAmount);
			const verticalObject = {
				x: 0,
				y: 0,
				z: 1
			};
			const dotProduct = deltaXAmount * verticalObject.x + deltaYAmount * verticalObject.y + deltaZAmount * verticalObject.z;
			const magnitude = Math.sqrt(deltaXAmount * deltaXAmount + deltaYAmount * deltaYAmount + deltaZAmount * deltaZAmount);

			const epsilon = 1e-10; // A small value to prevent division by zero
			const normalizedDotProduct = Math.abs(magnitude) < epsilon ? 0 : dotProduct / magnitude;
			const holeAngle = 180 - Math.acos(normalizedDotProduct) * (180 / Math.PI);

			const holeBearing = (450 - Math.atan2(deltaYAmount, deltaXAmount) * (180 / Math.PI)) % 360; //bearing in degrees

			if (!isNaN(startXLocation) && !isNaN(startYLocation) && !isNaN(startZLocation) && !isNaN(endXLocation) && !isNaN(endYLocation) && !isNaN(endZLocation) && !isNaN(timingDelayMilliseconds)) {
				// check if they are valid numbers
				points.push({
					entityName,
					entityType,
					holeID,
					startXLocation,
					startYLocation,
					startZLocation,
					endXLocation,
					endYLocation,
					endZLocation,
					holeDiameter,
					holeType,
					fromHoleID,
					timingDelayMilliseconds,
					colourHexDecimal,
					holeLengthCalculated,
					holeAngle,
					holeBearing,
					measuredLength,
					measuredLengthTimeStamp,
					measuredMass,
					measuredMassTimeStamp,
					measuredComment,
					measuredCommentTimeStamp
				});
				minX = Math.min(minX, startXLocation);
				minY = Math.min(minY, startYLocation);
			}
		} else if (values.length === 14) {
			// check if it has the correct number of values
			const entityName = values[0];
			const entityType = "hole";
			const holeID = values[2]; //Id of the blast hole
			const startXLocation = parseFloat(values[3]); //start of the blast hole X value
			const startYLocation = parseFloat(values[4]); //start of the blast hole Y value
			const startZLocation = parseFloat(values[5]); //start of the blast hole Z value
			const endXLocation = parseFloat(values[6]); //end of the blast hole X value
			const endYLocation = parseFloat(values[7]); //end of the blast hole Y value
			const endZLocation = parseFloat(values[8]); //end of the blast hole Z value
			const holeDiameter = parseFloat(values[9]); //diameter of the blast hole
			const holeType = values[10]; //type of the blast hole
			const fromHoleID = values[11]; //from hole where the connector tail will be
			const timingDelayMilliseconds = parseInt(values[12]); //delay from hole to Id of the blast
			const colourHexDecimal = values[13].replace(/\r$/, ""); //colour of the delay in HEXDECIMALS
			const measuredLength = 0;
			const measuredLengthTimeStamp = "09/05/1975 00:00:00";
			const measuredMass = 0;
			const measuredMassTimeStamp = "09/05/1975 00:00:00";
			const measuredComment = "None";
			const measuredCommentTimeStamp = "09/05/1975 00:00:00";
			const holeLengthCalculated = Math.pow(Math.pow(startXLocation - endXLocation, 2) + Math.pow(startYLocation - endYLocation, 2) + Math.pow(startZLocation - endZLocation, 2), 0.5); //calc the distance between sx,sy,sz and ex,ey,ez
			const deltaXAmount = endXLocation - startXLocation; // Calculate the differences between the longitude and latitude of the two points
			//console.log("X",deltaXAmount);
			const deltaYAmount = endYLocation - startYLocation; // Calculate the differences between the longitude and latitude of the two points
			//console.log("Y",deltaYAmount);
			const deltaZAmount = endZLocation - startZLocation; // Calculate the differences between the longitude and latitude of the two points
			//console.log("Z",deltaZAmount);
			const verticalObject = {
				x: 0,
				y: 0,
				z: 1
			};
			const dotProduct = deltaXAmount * verticalObject.x + deltaYAmount * verticalObject.y + deltaZAmount * verticalObject.z;
			const magnitude = Math.sqrt(deltaXAmount * deltaXAmount + deltaYAmount * deltaYAmount + deltaZAmount * deltaZAmount);

			const epsilon = 1e-10; // A small value to prevent division by zero
			const normalizedDotProduct = Math.abs(magnitude) < epsilon ? 0 : dotProduct / magnitude;
			const holeAngle = 180 - Math.acos(normalizedDotProduct) * (180 / Math.PI);

			const holeBearing = (450 - Math.atan2(deltaYAmount, deltaXAmount) * (180 / Math.PI)) % 360; //bearing in degrees

			if (!isNaN(startXLocation) && !isNaN(startYLocation) && !isNaN(startZLocation) && !isNaN(endXLocation) && !isNaN(endYLocation) && !isNaN(endZLocation) && !isNaN(timingDelayMilliseconds)) {
				// check if they are valid numbers
				points.push({
					entityName,
					entityType,
					holeID,
					startXLocation,
					startYLocation,
					startZLocation,
					endXLocation,
					endYLocation,
					endZLocation,
					holeDiameter,
					holeType,
					fromHoleID,
					timingDelayMilliseconds,
					colourHexDecimal,
					holeLengthCalculated,
					holeAngle,
					holeBearing,
					measuredLength,
					measuredLengthTimeStamp,
					measuredMass,
					measuredMassTimeStamp,
					measuredComment,
					measuredCommentTimeStamp
				});
				minX = Math.min(minX, startXLocation);
				minY = Math.min(minY, startYLocation);
			}
		} else if (values.length === 12) {
			// Skip empty lines and lines with fewer than 14 values
			if (values.length < 12) {
				continue;
			}
			//files with id, x, y, z, x, y, z, diameter, type, fromHoleID, delay, colour
			// check if it has the correct number of values
			const entityName = blastNameValue;
			const holeID = values[0]; //Id of the blast hole
			const startXLocation = parseFloat(values[1]); //start of the blast hole X value
			const startYLocation = parseFloat(values[2]); //start of the blast hole Y value
			const startZLocation = parseFloat(values[3]); //start of the blast hole Z value
			const endXLocation = parseFloat(values[4]); //end of the blast hole X value
			const endYLocation = parseFloat(values[5]); //end of the blast hole Y value
			const endZLocation = parseFloat(values[6]); //end of the blast hole Z value
			const holeDiameter = parseFloat(values[7]); //diameter of the blast hole
			const holeType = values[8]; //type of the blast hole
			const fromHoleID = values[9].includes(":::") ? values[9] : `${blastNameValue}:::${values[9]}`;
			//from hole where the connector tail will be
			const timingDelayMilliseconds = parseInt(values[10]); //delay from hole to Id of the blast
			const colourHexDecimal = values[11].replace(/\r$/, ""); //colour of the delay in HEXDECIMALS
			const measuredLength = 0;
			const measuredLengthTimeStamp = "09/05/1975 00:00:00";
			const measuredMass = 0;
			const measuredMassTimeStamp = "09/05/1975 00:00:00";
			const measuredComment = "None";
			const measuredCommentTimeStamp = "09/05/1975 00:00:00";
			const holeLengthCalculated = Math.pow(Math.pow(startXLocation - endXLocation, 2) + Math.pow(startYLocation - endYLocation, 2) + Math.pow(startZLocation - endZLocation, 2), 0.5); //calc the distance between sx,sy,sz and ex,ey,ez
			const deltaXAmount = endXLocation - startXLocation; // Calculate the differences between the longitude and latitude of the two points
			//console.log("X",deltaXAmount);
			const deltaYAmount = endYLocation - startYLocation; // Calculate the differences between the longitude and latitude of the two points
			//console.log("Y",deltaYAmount);
			const deltaZAmount = endZLocation - startZLocation; // Calculate the differences between the longitude and latitude of the two points
			//console.log("Z",deltaZAmount);
			const verticalObject = {
				x: 0,
				y: 0,
				z: 1
			};
			const dotProduct = deltaXAmount * verticalObject.x + deltaYAmount * verticalObject.y + deltaZAmount * verticalObject.z;
			const magnitude = Math.sqrt(deltaXAmount * deltaXAmount + deltaYAmount * deltaYAmount + deltaZAmount * deltaZAmount);

			const epsilon = 1e-10; // A small value to prevent division by zero
			const normalizedDotProduct = Math.abs(magnitude) < epsilon ? 0 : dotProduct / magnitude;
			const holeAngle = 180 - Math.acos(normalizedDotProduct) * (180 / Math.PI);

			const holeBearing = (450 - Math.atan2(deltaYAmount, deltaXAmount) * (180 / Math.PI)) % 360; //bearing in degrees

			if (!isNaN(startXLocation) && !isNaN(startYLocation) && !isNaN(startZLocation) && !isNaN(endXLocation) && !isNaN(endYLocation) && !isNaN(endZLocation) && !isNaN(timingDelayMilliseconds)) {
				// check if they are valid numbers
				points.push({
					entityName,
					entityType,
					holeID,
					startXLocation,
					startYLocation,
					startZLocation,
					endXLocation,
					endYLocation,
					endZLocation,
					holeDiameter,
					holeType,
					fromHoleID,
					timingDelayMilliseconds,
					colourHexDecimal,
					holeLengthCalculated,
					holeAngle,
					holeBearing,
					measuredLength,
					measuredLengthTimeStamp,
					measuredMass,
					measuredMassTimeStamp,
					measuredComment,
					measuredCommentTimeStamp
				});
				minX = Math.min(minX, startXLocation);
				minY = Math.min(minY, startYLocation);
			}
			////console.log(points);
		} else if (values.length === 9) {
			// Skip empty lines and lines with fewer than 14 values
			if (values.length < 9) {
				continue;
			}
			//files with id, x, y, z, x, y, z, diameter, type
			// check if it has the correct number of values
			const entityName = blastNameValue;
			const holeID = values[0];
			const startXLocation = parseFloat(values[1]); //start of the blast hole X value
			const startYLocation = parseFloat(values[2]); //start of the blast hole Y value
			const startZLocation = parseFloat(values[3]); //start of the blast hole Z value
			const endXLocation = parseFloat(values[4]); //end of the blast hole X value
			const endYLocation = parseFloat(values[5]); //end of the blast hole Y value
			const endZLocation = parseFloat(values[6]); //end of the blast hole Z value
			const holeDiameter = parseFloat(values[7]);
			const holeType = values[8];
			const holeLengthCalculated = Math.pow(Math.pow(startXLocation - endXLocation, 2) + Math.pow(startYLocation - endYLocation, 2) + Math.pow(startZLocation - endZLocation, 2), 0.5); //calc the distance between sx,sy,sz and ex,ey,ez
			const deltaXAmount = endXLocation - startXLocation; // Calculate the differences between the longitude and latitude of the two points
			const deltaYAmount = endYLocation - startYLocation; // Calculate the differences between the longitude and latitude of the two points
			const deltaZAmount = endZLocation - startZLocation; // Calculate the differences between the longitude and latitude of the two points
			const verticalObject = {
				x: 0,
				y: 0,
				z: 1
			};
			const dotProduct = deltaXAmount * verticalObject.x + deltaYAmount * verticalObject.y + deltaZAmount * verticalObject.z; // Calculate the dot product
			const magnitude = Math.pow(deltaXAmount * deltaXAmount + deltaYAmount * deltaYAmount + deltaZAmount * deltaZAmount, 0.5); // Calculate the magnitudes of the two vectors
			const holeAngle = 180 - Math.acos(dotProduct / magnitude) * (180 / Math.PI); //angle in degrees;
			const holeBearing = (450 - Math.atan2(deltaYAmount, deltaXAmount) * (180 / Math.PI)) % 360; //bearing in degrees
			const fromHoleID = `${blastNameValue}:::${values[0]}`;
			const timingDelayMilliseconds = 0;
			const colourHexDecimal = "red";
			const measuredLength = 0;
			const measuredLengthTimeStamp = "09/05/1975 00:00:00";
			const measuredMass = 0;
			const measuredMassTimeStamp = "09/05/1975 00:00:00";
			const measuredComment = "None";
			const measuredCommentTimeStamp = "09/05/1975 00:00:00";
			if (!isNaN(startXLocation) && !isNaN(startYLocation) && !isNaN(startZLocation) && !isNaN(endXLocation) && !isNaN(endYLocation) && !isNaN(endZLocation)) {
				// check if they are valid numbers
				points.push({
					entityName,
					entityType,
					holeID,
					startXLocation,
					startYLocation,
					startZLocation,
					endXLocation,
					endYLocation,
					endZLocation,
					holeDiameter,
					holeType,
					fromHoleID,
					timingDelayMilliseconds,
					colourHexDecimal,
					holeLengthCalculated,
					holeAngle,
					holeBearing,
					measuredLength,
					measuredLengthTimeStamp,
					measuredMass,
					measuredMassTimeStamp,
					measuredComment,
					measuredCommentTimeStamp
				});
				minX = Math.min(minX, startXLocation);
				minY = Math.min(minY, startYLocation);
			}
		} else if (values.length === 7) {
			//files with id, x, y, z, x, y, z
			// check if it has the correct number of values
			const entityName = blastNameValue;
			const holeID = values[0];
			const startXLocation = parseFloat(values[1]); //start of the blast hole X value
			const startYLocation = parseFloat(values[2]); //start of the blast hole Y value
			const startZLocation = parseFloat(values[3]); //start of the blast hole Z value
			const endXLocation = parseFloat(values[4]); //end of the blast hole X value
			const endYLocation = parseFloat(values[5]); //end of the blast hole Y value
			const endZLocation = parseFloat(values[6]); //end of the blast hole Z value
			const holeDiameter = 0;
			const holeType = "Undefined";
			const holeLengthCalculated = Math.pow(Math.pow(startXLocation - endXLocation, 2) + Math.pow(startYLocation - endYLocation, 2) + Math.pow(startZLocation - endZLocation, 2), 0.5); //calc the distance between sx,sy,sz and ex,ey,ez
			const deltaXAmount = endXLocation - startXLocation; // Calculate the differences between the longitude and latitude of the two points
			const deltaYAmount = endYLocation - startYLocation; // Calculate the differences between the longitude and latitude of the two points
			const deltaZAmount = endZLocation - startZLocation; // Calculate the differences between the longitude and latitude of the two points
			const verticalObject = {
				x: 0,
				y: 0,
				z: 1
			};
			const dotProduct = deltaXAmount * verticalObject.x + deltaYAmount * verticalObject.y + deltaZAmount * verticalObject.z; // Calculate the dot product
			const magnitude = Math.pow(deltaXAmount * deltaXAmount + deltaYAmount * deltaYAmount + deltaZAmount * deltaZAmount, 0.5); // Calculate the magnitudes of the two vectors
			const holeAngle = 180 - Math.acos(dotProduct / magnitude) * (180 / Math.PI); //angle in degrees;
			const holeBearing = (450 - Math.atan2(deltaYAmount, deltaXAmount) * (180 / Math.PI)) % 360; //bearing in degrees
			const fromHoleID = `${blastNameValue}:::${values[0]}`;
			console.log("blastNameValue:", blastNameValue);
			console.log("values[0]:", values[0]);
			console.log("fromHoleID:", fromHoleID);
			const timingDelayMilliseconds = 0;
			const colourHexDecimal = "red";
			const measuredLength = 0;
			const measuredLengthTimeStamp = "09/05/1975 00:00:00";
			const measuredMass = 0;
			const measuredMassTimeStamp = "09/05/1975 00:00:00";
			const measuredComment = "None";
			const measuredCommentTimeStamp = "09/05/1975 00:00:00";
			if (!isNaN(startXLocation) && !isNaN(startYLocation) && !isNaN(startZLocation) && !isNaN(endXLocation) && !isNaN(endYLocation) && !isNaN(endZLocation)) {
				// check if they are valid numbers
				points.push({
					entityName,
					entityType,
					holeID,
					startXLocation,
					startYLocation,
					startZLocation,
					endXLocation,
					endYLocation,
					endZLocation,
					holeDiameter,
					holeType,
					fromHoleID,
					timingDelayMilliseconds,
					colourHexDecimal,
					holeLengthCalculated,
					holeAngle,
					holeBearing,
					measuredLength,
					measuredLengthTimeStamp,
					measuredMass,
					measuredMassTimeStamp,
					measuredComment,
					measuredCommentTimeStamp
				});
				minX = Math.min(minX, startXLocation);
				minY = Math.min(minY, startYLocation);
			}
		}
		if (values.length === 4) {
			//files with id, x, y, z
			// check if it has the correct number of values
			const entityName = blastNameValue;
			const holeID = values[0];
			const startXLocation = parseFloat(values[1]); //start of the blast hole X value
			const startYLocation = parseFloat(values[2]); //start of the blast hole Y value
			const startZLocation = parseFloat(values[3]); //start of the blast hole Z value
			const endXLocation = parseFloat(values[1]); //end of the blast hole X value
			const endYLocation = parseFloat(values[2]); //end of the blast hole Y value
			const endZLocation = parseFloat(values[3]); //end of the blast hole Z value
			const holeDiameter = 0;
			const holeType = "Undefined";
			const holeLengthCalculated = 0;
			const holeAngle = 0;
			const holeBearing = 0;
			const fromHoleID = `${blastNameValue}:::${values[0]}`;
			const timingDelayMilliseconds = 0;
			const colourHexDecimal = "red";
			const measuredLength = 0;
			const measuredLengthTimeStamp = "09/05/1975 00:00:00";
			const measuredMass = 0;
			const measuredMassTimeStamp = "09/05/1975 00:00:00";
			const measuredComment = "None";
			const measuredCommentTimeStamp = "09/05/1975 00:00:00";
			if (!isNaN(startXLocation) && !isNaN(startYLocation) && !isNaN(startZLocation)) {
				// check if they are valid numbers
				points.push({
					entityName,
					entityType,
					holeID,
					startXLocation,
					startYLocation,
					startZLocation,
					endXLocation,
					endYLocation,
					endZLocation,
					holeDiameter,
					holeType,
					fromHoleID,
					timingDelayMilliseconds,
					colourHexDecimal,
					holeLengthCalculated,
					holeAngle,
					holeBearing,
					measuredLength,
					measuredLengthTimeStamp,
					measuredMass,
					measuredMassTimeStamp,
					measuredComment,
					measuredCommentTimeStamp
				});
				minX = Math.min(minX, startXLocation);
				minY = Math.min(minY, startYLocation);
			}
			//} else if (localStorage.getItem("kirraDataPoints") !== null) {
			//return points;
		}
	}
	// Set the centroid to the center of the data
	//NOT IN USE YET
	//convert points array to the holeKadMap
	//for (let i = 0; i < points.length; i++) {
	//	const holeID = points[i].holeID;
	//	const entityName = points[i].entityName;
	//	const entityType = points[i].entityType;
	//
	//	if (!kadHolesMap.has(entityName)) {
	//		kadHolesMap.set(entityName, {
	//			entityName: entityName,
	//			entityType: entityType,
	//			data: []
	//		});
	//	}
	//	kadHolesMap.get(entityName).data.push(points[i]);
	//}
	calculateTimes(points);
	return points;
}
function fileFormatPopup(error) {
	console.log("File format error");
	Swal.fire({
		title: `Error ${error}`,
		showCancelButton: false,
		confirmButtonText: "Ok",
		icon: "error",
		html: `
		  <label class="labelWhite18">This could be related to the data structure or file.</label><br>
		  <label class="labelWhite18">Or there are NO blasts or Holes yet, if so ignore.</label><br>
		  <label class="labelWhite18">Only files with 4, 7, 9, and 14 columns are Accepted</label><br>
		  <label class="labelWhite12">Column Order and Types are important.</label><br>
		  `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	}).then((result) => {
		if (result.isConfirmed) {
			//console.log("Confirmed");
			return; // Exit the function
		}
	});
	return; // Exit the function
}
// Create a Map for each entity type to store entities by name
const kadHolesMap = new Map();
const kadPointsMap = new Map();
const kadPolygonsMap = new Map();
const kadLinesMap = new Map();
const kadCirclesMap = new Map();
const kadTextsMap = new Map();

// ???.kad files are kirra app native files that contain blast hole data and drawing data

function parseKADFile(fileData) {
	const dataLines = fileData.split("\n");
	let minX = Infinity;
	let minY = Infinity;
	let pointID, pointXLocation, pointYLocation, pointZLocation, text, radius, colour;

	// Parse the kad file data
	for (let i = 0; i < dataLines.length; i++) {
		const row = dataLines[i].split(",");
		const entityName = row[0];
		const entityType = row[1];

		// Parsing logic for different entity types
		switch (entityType) {
			//KAD Holes not used
			//case "hole":
			//	// Create an empty entity object if it doesn't exist
			//	if (!kadHolesMap.has(entityName)) {
			//		kadHolesMap.set(entityName, {
			//			name: entityName, // Store the entityName
			//			entityType: entityType,
			//			data: []
			//		});
			//	}
			//	const holeID = row[2];
			//	const startXLocation = parseFloat(row[3]);
			//	const startYLocation = parseFloat(row[4]);
			//	const startZLocation = parseFloat(row[5]);
			//	const endXLocation = parseFloat(row[6]);
			//	const endYLocation = parseFloat(row[7]);
			//	const endZLocation = parseFloat(row[8]);
			//	const holeDiameter = parseFloat(row[9]);
			//	const holeType = row[10];
			//	const fromHoleID = row[11];
			//	const timingDelayMilliseconds = parseInt(row[12]);
			//	const colourDelay = row[13].replace(/\r$/, "");
			//
			//	if (!isNaN(startXLocation) && !isNaN(startYLocation) && !isNaN(startZLocation) && !isNaN(endXLocation) && !isNaN(endYLocation) && !isNaN(endZLocation) && !isNaN(timingDelayMilliseconds)) {
			//		// Check if they are valid numbers
			//		const holeLengthCalculated = Math.sqrt(Math.pow(startXLocation - endXLocation, 2) + Math.pow(startYLocation - endYLocation, 2) + Math.pow(startZLocation - endZLocation, 2));
			//
			//		const deltaXAmount = endXLocation - startXLocation;
			//		const deltaYAmount = endYLocation - startYLocation;
			//		const deltaZAmount = endZLocation - startZLocation;
			//
			//		const dotProduct = deltaXAmount * 0 + deltaYAmount * 0 + deltaZAmount * 1;
			//		const magnitude = Math.sqrt(deltaXAmount * deltaXAmount + deltaYAmount * deltaYAmount + deltaZAmount * deltaZAmount);
			//
			//		const epsilon = 1e-10;
			//		const normalizedDotProduct = Math.abs(magnitude) < epsilon ? 0 : dotProduct / magnitude;
			//		const holeAngle = 180 - Math.acos(normalizedDotProduct) * (180 / Math.PI);
			//
			//		const holeBearing = (450 - Math.atan2(deltaYAmount, deltaXAmount) * (180 / Math.PI)) % 360;
			//
			//		// Push the parsed data into the entity's data array
			//		kadHolesMap.get(entityName).data.push({
			//			entityName: entityName,
			//			entityType: entityType,
			//			holeID: holeID,
			//			startXLocation: startXLocation,
			//			startYLocation: startYLocation,
			//			startZLocation: startZLocation,
			//			endXLocation: endXLocation,
			//			endYLocation: endYLocation,
			//			endZLocation: endZLocation,
			//			holeDiameter: holeDiameter,
			//			holeType: holeType,
			//			fromHoleID: fromHoleID,
			//			timingDelayMilliseconds: timingDelayMilliseconds,
			//			colourHexDecimal: colourDelay,
			//			holeLengthCalculated: holeLengthCalculated,
			//			holeAngle: holeAngle,
			//			holeBearing: holeBearing
			//		});
			//
			//		minX = Math.min(minX, startXLocation);
			//		minY = Math.min(minY, startYLocation);
			//	}
			//	break;
			case "point":
				// Create an empty entity object if it doesn't exist
				if (!kadPointsMap.has(entityName)) {
					kadPointsMap.set(entityName, {
						entityName: entityName, // Store the entityName
						entityType: entityType,
						data: []
					});
				}
				pointID = row[2]; // Id of the point
				pointXLocation = parseFloat(row[3]); // X value of the point
				pointYLocation = parseFloat(row[4]); // Y value of the point
				pointZLocation = parseFloat(row[5]); // Z value of the point
				colour = row[6].replace(/\r$/, ""); // Colour of the point in HEXDECIMALS
				kadPointsMap.get(entityName).data.push({
					entityName: entityName,
					entityType: entityType,
					pointID: pointID,
					pointXLocation: pointXLocation,
					pointYLocation: pointYLocation,
					pointZLocation: pointZLocation,
					colour: colour
				});
				break;
			case "poly":
				// Create an empty entity object if it doesn't exist
				if (!kadPolygonsMap.has(entityName)) {
					kadPolygonsMap.set(entityName, {
						entityName: entityName, // Store the entityName
						entityType: entityType,
						data: []
					});
				}
				pointID = row[2]; // Id of the point
				pointXLocation = parseFloat(row[3]); // X value of the point
				pointYLocation = parseFloat(row[4]); // Y value of the point
				pointZLocation = parseFloat(row[5]); // Z value of the point
				lineWidth = parseFloat(row[6]); // Width of the line
				colour = row[7].replace(/\r$/, ""); // Colour of the point in HEXDECIMALS
				kadPolygonsMap.get(entityName).data.push({
					entityName: entityName,
					entityType: entityType,
					pointID: pointID,
					pointXLocation: pointXLocation,
					pointYLocation: pointYLocation,
					pointZLocation: pointZLocation,
					lineWidth: lineWidth,
					colour: colour
				});
				break;
			case "line":
				// Create an empty entity object if it doesn't exist
				if (!kadLinesMap.has(entityName)) {
					kadLinesMap.set(entityName, {
						name: entityName, // Store the entityName
						entityType: entityType,
						data: []
					});
				}
				pointID = row[2]; // Id of the point
				pointXLocation = parseFloat(row[3]); // X value of the point
				pointYLocation = parseFloat(row[4]); // Y value of the point
				pointZLocation = parseFloat(row[5]); // Z value of the point
				lineWidth = parseFloat(row[6]); // Width of the line
				colour = row[7].replace(/\r$/, ""); // Colour of the point in HEXDECIMALS
				kadLinesMap.get(entityName).data.push({
					entityName: entityName,
					entityType: entityType,
					pointID: pointID,
					pointXLocation: pointXLocation,
					pointYLocation: pointYLocation,
					pointZLocation: pointZLocation,
					lineWidth: lineWidth,
					colour: colour
				});
				break;
			case "circle":
				// Create an empty entity object if it doesn't exist
				if (!kadCirclesMap.has(entityName)) {
					kadCirclesMap.set(entityName, {
						name: entityName, // Store the entityName
						entityType: entityType,
						data: []
					});
				}
				pointID = row[2]; // Id of the point
				pointXLocation = parseFloat(row[3]); // X value of the point
				pointYLocation = parseFloat(row[4]); // Y value of the point
				pointZLocation = parseFloat(row[5]); // Z value of the point
				radius = parseFloat(row[6]); // Radius of the circle
				lineWidth = parseFloat(row[7]); // Width of the line
				colour = row[8].replace(/\r$/, ""); // Colour of the point in HEXDECIMALS
				kadCirclesMap.get(entityName).data.push({
					name: entityName,
					entityType: entityType,
					pointID: pointID,
					pointXLocation: pointXLocation,
					pointYLocation: pointYLocation,
					pointZLocation: pointZLocation,
					radius: radius,
					lineWidth: lineWidth,
					colour: colour
				});
				break;
			case "text":
				// Create an empty entity object if it doesn't exist
				if (!kadTextsMap.has(entityName)) {
					kadTextsMap.set(entityName, {
						name: entityName, // Store the entityName
						entityType: entityType,
						data: []
					});
				}
				pointID = row[2]; // Id of the point
				pointXLocation = parseFloat(row[3]); // X value of the point
				pointYLocation = parseFloat(row[4]); // Y value of the point
				pointZLocation = parseFloat(row[5]); // Z value of the point
				text = row[6]; // Text Value
				colour = row[7].replace(/\r$/, ""); // Colour of the point in HEXDECIMALS
				kadTextsMap.get(entityName).data.push({
					name: entityName,
					entityType: entityType,
					pointID: pointID,
					pointXLocation: pointXLocation,
					pointYLocation: pointYLocation,
					pointZLocation: pointZLocation,
					text: text,
					colour: colour
				});
				break;
			default:
				break;
		}
	}
	//Get all the map X and Y coordinates from all the kadPointsMap, kadLineMap, kadPolygonsMap, kadCirclesMap, kadHolesMap and kadTextsMap data and then calculate the centroidX and centroidY
	let sumX = 0;
	let sumY = 0;
	let count = 0;
	for (let [key, value] of kadPointsMap) {
		for (let i = 0; i < value.data.length; i++) {
			sumX += value.data[i].pointXLocation;
			sumY += value.data[i].pointYLocation;
			count++;
		}
	}
	for (let [key, value] of kadLinesMap) {
		for (let i = 0; i < value.data.length; i++) {
			sumX += value.data[i].pointXLocation;
			sumY += value.data[i].pointYLocation;
			count++;
		}
	}
	for (let [key, value] of kadPolygonsMap) {
		for (let i = 0; i < value.data.length; i++) {
			sumX += value.data[i].pointXLocation;
			sumY += value.data[i].pointYLocation;
			count++;
		}
	}
	for (let [key, value] of kadCirclesMap) {
		for (let i = 0; i < value.data.length; i++) {
			sumX += value.data[i].pointXLocation;
			sumY += value.data[i].pointYLocation;
			count++;
		}
	}
	//KAD Holes NOT USED
	//for (let [key, value] of kadHolesMap) {
	//	for (let i = 0; i < value.data.length; i++) {
	//		sumX += value.data[i].startXLocation;
	//		sumY += value.data[i].startYLocation;
	//		count++;
	//	}
	//}
	for (let [key, value] of kadTextsMap) {
		for (let i = 0; i < value.data.length; i++) {
			sumX += value.data[i].pointXLocation;
			sumY += value.data[i].pointYLocation;
			count++;
		}
	}
	centroidX = sumX / count;
	centroidY = sumY / count;

	console.log(kadPointsMap);
	console.log(kadLinesMap);
	console.log(kadPolygonsMap);
	console.log(kadCirclesMap);
	//console.log(kadHolesMap);
	console.log(kadTextsMap);

	// Clear the points array and copy data from the Map
	//points = Array.from(kadHolesMap.values()).flatMap(entity => entity.data);
	// Similarly, clear other arrays and store data for other entity types...
}
let mapData = [kadHolesMap, kadPointsMap, kadPolygonsMap, kadLinesMap, kadCirclesMap, kadTextsMap];

function exportKADFile(mapData) {
	// Prepare the CSV content for .kad file
	let csvContentKAD = "";
	let csvContentTXT = "";

	for (const map of mapData) {
		for (const entry of map.entries()) {
			const entityName = entry[0];
			//console.log(entityName);
			const entityData = entry[1];
			//console.log(entityData);

			if (entityData.entityType.trim() === "hole") {
				//commented out to avoid exporting holes
				//console.log(entityData.entityType);
				//for (const hole of entityData.data) {
				//	const csvLine = `${entityName},${hole.entityType},${hole.holeID},${hole.startXLocation},${hole.startYLocation},${hole.startZLocation},${hole.endXLocation},${hole.endYLocation},${hole.endZLocation},${hole.holeDiameter},${hole.holeType},${hole.fromHoleID},${hole.timingDelayMilliseconds},${hole.colourHexDecimal},${hole.holeLengthCalculated},${hole.holeAngle},${hole.holeBearing}\n`;
				//	csvContentKAD += csvLine;
				//}
			} else if (entityData.entityType.trim() === "point") {
				//console.log(entityData.entityType);
				for (const point of entityData.data) {
					const csvLine = `${entityName},${point.entityType},${point.pointID},${point.pointXLocation},${point.pointYLocation},${point.pointZLocation},${point.colour}\n`;
					csvContentKAD += csvLine;
					csvContentTXT += csvLine;
				}
			} else if (entityData.entityType.trim() === "poly") {
				//console.log(entityData.entityType);
				for (const polygon of entityData.data) {
					const csvLine = `${entityName},${polygon.entityType},${polygon.pointID},${polygon.pointXLocation},${polygon.pointYLocation},${polygon.pointZLocation},${polygon.lineWidth},${polygon.colour}\n`;
					csvContentKAD += csvLine;
					csvContentTXT += csvLine;
				}
			} else if (entityData.entityType.trim() === "line") {
				//console.log(entityData.entityType);
				for (const entityLine of entityData.data) {
					const csvLine = `${entityName},${entityLine.entityType},${entityLine.pointID},${entityLine.pointXLocation},${entityLine.pointYLocation},${entityLine.pointZLocation},${entityLine.lineWidth},${entityLine.colour}\n`;
					csvContentKAD += csvLine;
					csvContentTXT += csvLine;
				}
			} else if (entityData.entityType.trim() === "circle") {
				//console.log(entityData.entityType);
				for (const circle of entityData.data) {
					const csvLine = `${entityName},${circle.entityType},${circle.pointID},${circle.pointXLocation},${circle.pointYLocation},${circle.pointZLocation},${circle.radius},${circle.lineWidth},${circle.colour}\n`;
					csvContentKAD += csvLine;
					csvContentTXT += csvLine;
				}
			} else if (entityData.entityType.trim() === "text") {
				//console.log(entityData.entityType);
				for (const text of entityData.data) {
					const csvLine = `${entityName},${text.entityType},${text.pointID},${text.pointXLocation},${text.pointYLocation},${text.pointZLocation},${text.text},${text.colour}\n`;
					csvContentKAD += csvLine;
					csvContentTXT += csvLine;
				}
			}
		}
	}
	// Create a Blob with the CSV content for .kad file
	const blobKAD = new Blob([csvContentKAD], {
		type: "text/csv"
	});

	// Create a Blob with the CSV content for .txt file
	const blobTXT = new Blob([csvContentTXT], {
		type: "text/plain"
	});

	// Create temporary anchor elements to trigger the download for both files
	const aKAD = document.createElement("a");
	const aTXT = document.createElement("a");

	// Set the content for the anchor elements
	aKAD.href = URL.createObjectURL(blobKAD);
	aKAD.download = "KAD_EXPORT" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".kad";

	aTXT.href = URL.createObjectURL(blobTXT);
	aTXT.download = "TXT_EXPORT" + new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_") + ".txt";

	// Simulate clicks on both anchor elements to trigger the downloads
	aKAD.click();
	aTXT.click();
}
// Example usage
//const mapData = [kadHolesMap, kadPointsMap, kadPolygonsMap, kadLinesMap, kadCirclesMap, kadTextsMap];
//exportMapDataCSV(mapData);

function convertPointsTo14ColumnCSV() {
	let csv = "";

	// Add the CSV header if needed
	//const header = "holeID,startXLocation,startYLocation,startZLocation,endXLocation,endYLocation,endZLocation,holeDiameter, holeType,fromHoleID,timingDelayMilliseconds,colourHexDecimal,holeLengthCalculated,holeAngle,holeBearing";
	//csv += header + "\n";

	// Iterate over the points array and convert each object to a CSV row
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		const row = `${point.entityName},${point.entityType},${point.holeID},${point.startXLocation},${point.startYLocation},${point.startZLocation},${point.endXLocation},${point.endYLocation},${point.endZLocation},${point.holeDiameter},${point.holeType},${point.fromHoleID},${point.timingDelayMilliseconds},${point.colourHexDecimal}`; //,${point.holeLengthCalculated},${point.holeAngle},${point.holeBearing}`;
		csv += row + "\n";
	}

	return csv;
}

function convertPointsTo12ColumnCSV() {
	let csv = "";

	// Add the CSV header if needed
	//const header = "holeID,startXLocation,startYLocation,startZLocation,endXLocation,endYLocation,endZLocation,holeDiameter, holeType,fromHoleID,timingDelayMilliseconds,colourHexDecimal,holeLengthCalculated,holeAngle,holeBearing";
	//csv += header + "\n";

	// Iterate over the points array and convert each object to a CSV row
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		const row = `${point.entityName},${point.entityType},${point.holeID},${point.startXLocation},${point.startYLocation},${point.startZLocation},${point.endXLocation},${point.endYLocation},${point.endZLocation},${point.holeDiameter},${point.holeType},${point.fromHoleID},${point.timingDelayMilliseconds},${point.colourHexDecimal}`; //,${point.holeLengthCalculated},${point.holeAngle},${point.holeBearing}`;
		csv += row + "\n";
	}

	return csv;
}

function convertPointsToAllDataCSV() {
	let csv = "";

	// Add the CSV header if needed
	const header = "entityName,entityType,holeID,startXLocation,startYLocation,startZLocation,endXLocation,endYLocation,endZLocation,holeDiameter,holeType,fromHoleID,timingDelayMilliseconds,colourHexDecimal,holeLengthCalculated,holeAngle,holeBearing,initiationTime,measuredLength,measuredLengthTimeStamp,measuredMass,measuredMassTimeStamp,measuredComment,measuredCommentTimeStamp";
	csv += header + "\n";

	// Iterate over the points array and convert each object to a CSV row
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		const row = `${point.entityName},${point.entityType},${point.holeID},${point.startXLocation},${point.startYLocation},${point.startZLocation},${point.endXLocation},${point.endYLocation},${point.endZLocation},${point.holeDiameter},${point.holeType},${point.fromHoleID},${point.timingDelayMilliseconds},${point.colourHexDecimal},${point.holeLengthCalculated},${point.holeAngle},${point.holeBearing},${point.holeTime},${point.measuredLength},${point.measuredLengthTimeStamp},${point.measuredMass},${point.measuredMassTimeStamp},${point.measuredComment},${point.measuredCommentTimeStamp}`;
		csv += row + "\n";
	}

	return csv;
}
//Exports the measured values to a CSV file
function convertPointsToActualDataCSV() {
	let csv = "";

	// Add the CSV header if needed
	const header = "entityName,entityType,holeID,measuredLength,measuredLengthTimeStamp,measuredMass,measuredMassTimeStamp,measuredComment,measuredCommentTimeStamp";
	csv += header + "\n";

	// Iterate over the points array and convert each object to a CSV row
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		const row = `${point.entityName},${point.entityType},${point.holeID},${point.measuredLength},${point.measuredLengthTimeStamp},${point.measuredMass},${point.measuredMassTimeStamp},${point.measuredComment},${point.measuredCommentTimeStamp}`;
		csv += row + "\n";
	}

	return csv;
}

function convertPointsToAQMCSV(points, fileNameValue, blastName, patternName, materialType, instructionValue, useHoleTypeAsInstruction, writeIngoreColumn, columnOrderArray) {
	let aqm = "";
	let material = materialType;
	let pattern = patternName;
	let blast = blastName;
	let instruction = instructionValue;
	let fileName = fileNameValue;
	let columns = columnOrderArray; // 11 possible columns

	// Iterate over the points array and convert each object to an AQM row
	for (let i = 0; i < points.length; i++) {
		const point = points[i];

		let columnOrder = []; // Initialize the column order for each row

		let toeX = parseFloat(point.endXLocation.toFixed(4));
		let toeY = parseFloat(point.endYLocation.toFixed(4));
		let toeZ = parseFloat(point.endZLocation.toFixed(4));
		// Iterate over the columns and map them to their corresponding values
		for (let j = 0; j < columns.length; j++) {
			if (columns[j] === "Pattern") {
				columnOrder.push(pattern);
			} else if (columns[j] === "Blast") {
				columnOrder.push(blast);
			} else if (columns[j] === "Name") {
				columnOrder.push(point.holeID);
			} else if (columns[j] === "Easting") {
				columnOrder.push(toeX); // Assuming 'toeX' holds the Easting value
			} else if (columns[j] === "Northing") {
				columnOrder.push(toeY); // Assuming 'toeY' holds the Northing value
			} else if (columns[j] === "Elevation") {
				columnOrder.push(toeZ); // Assuming 'toeZ' holds the Elevation value
			} else if (columns[j] === "Angle") {
				columnOrder.push(point.holeAngle);
			} else if (columns[j] === "Azimuth") {
				let azimuth = parseFloat(((point.holeBearing - 180) % 360).toFixed(1));
				if (azimuth < 0) {
					azimuth += 360;
				}
				columnOrder.push(azimuth);
			} else if (columns[j] === "Diameter") {
				columnOrder.push(point.holeDiameter);
			} else if (columns[j] === "Material Type") {
				columnOrder.push(material);
			} else if (columns[j] === "Instruction") {
				if (useHoleTypeAsInstruction) {
					columnOrder.push(point.holeType);
				} else {
					columnOrder.push(instruction);
				}
			} else if (columns[j] === "Ignore") {
				if (writeIngoreColumn) {
					columnOrder.push("ignored");
				} else {
					//do nothing
				}

				// Default to an empty string for unknown columns
			}
		}

		// Join the column values to create a row and add it to the AQM string
		const row = columnOrder.join(",");
		aqm += row + "\n";
	}

	return aqm;
}

function convertPointsToIREDESXML(points, filename, planID, siteID, holeOptions, mwd, chksumType) {
	const now = new Date();
	//convert now to the computer time zone
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
	let iredesPoints = [];
	points.forEach((point) => {
		iredesPoints.push({
			holeID: point.holeID,
			startXLocation: point.startXLocation,
			startYLocation: point.startYLocation,
			startZLocation: point.startZLocation,
			endXLocation: point.endXLocation,
			endYLocation: point.endYLocation,
			endZLocation: point.endZLocation,
			holeDiameter: point.holeDiameter,
			holeType: point.holeType
		});
	});
	iredesPoints.sort((a, b) => a.holeID.localeCompare(b.holeID));

	// Format the date as YYYY-MM-DDTHH:mm:ss
	const formattedDate = now.toISOString().slice(0, 19);
	let notes = "Notes";
	const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated by Kirra - https://blastingapps.xyz/kirra.html -->\n`;
	let xml = `${xmlHeader}<DRPPlan xmlns:IR="http://www.iredes.org/xml" IRVersion="V 1.0" IRDownwCompat="V 1.0" DRPPlanDownwCompat="V 1.0" DRPPlanVersion="V 1.0" xmlns="http://www.iredes.org/xml/DrillRig">\n`;

	// General Header
	xml += `  <IR:GenHead>\n`;
	xml += `    <IR:FileCreateDate>${formattedDate}</IR:FileCreateDate>\n`;
	xml += `    <IR:IRversion DownwCompat="V 1.0">V 1.0</IR:IRversion>\n`;
	xml += `  </IR:GenHead>\n`;
	xml += `  <IR:PlanId>${planID}</IR:PlanId>\n`;
	xml += `  <IR:PlanName>${planID}</IR:PlanName>\n`;
	xml += `  <IR:Comment>${notes}</IR:Comment>\n`;
	xml += `  <IR:Project>${siteID}(Site)</IR:Project>\n`;
	xml += `  <IR:WorkOrder>${siteID}(WorkOrder)</IR:WorkOrder>\n`;

	// Drill Position Plan
	xml += `  <DrillPosPlan IRVersion="V 1.0" IRDownwCompat="V 1.0">\n`;
	xml += `    <IR:GenHead>\n`;
	xml += `      <IR:FileCreateDate>${formattedDate}</IR:FileCreateDate>\n`;
	xml += `      <IR:IRversion DownwCompat="V 1.0">V 1.0</IR:IRversion>\n`;
	xml += `    </IR:GenHead>\n`;
	xml += `    <IR:PlanId>${planID}</IR:PlanId>\n`;
	xml += `    <IR:PlanName>${planID}</IR:PlanName>\n`;
	xml += `    <IR:Comment>${notes}</IR:Comment>\n`;
	xml += `    <IR:Project>${siteID}(Site)</IR:Project>\n`;
	xml += `    <IR:WorkOrder>${siteID}(WorkOrder)</IR:WorkOrder>\n`;

	// Position Data
	xml += `    <PositionData>\n`;
	xml += `      <Coordsystem>\n`;
	xml += `        <IR:CoordSysName>local</IR:CoordSysName>\n`;
	xml += `        <IR:TMatrix>\n`;
	xml += `          <IR:Col>\n`;
	xml += `            <IR:x>1.000</IR:x>\n`;
	xml += `            <IR:y>0.000</IR:y>\n`;
	xml += `            <IR:z>0.000</IR:z>\n`;
	xml += `            <IR:w>0.000</IR:w>\n`;
	xml += `          </IR:Col>\n`;
	xml += `          <IR:Col>\n`;
	xml += `            <IR:x>0.000</IR:x>\n`;
	xml += `            <IR:y>1.000</IR:y>\n`;
	xml += `            <IR:z>0.000</IR:z>\n`;
	xml += `            <IR:w>0.000</IR:w>\n`;
	xml += `          </IR:Col>\n`;
	xml += `          <IR:Col>\n`;
	xml += `            <IR:x>0.000</IR:x>\n`;
	xml += `            <IR:y>0.000</IR:y>\n`;
	xml += `            <IR:z>1.000</IR:z>\n`;
	xml += `            <IR:w>0.000</IR:w>\n`;
	xml += `          </IR:Col>\n`;
	xml += `        </IR:TMatrix>\n`;
	xml += `        <IR:CsysType>L</IR:CsysType>\n`;
	xml += `      </Coordsystem>\n`;
	xml += `      <PlanIdRef />\n`;
	xml += `      <Bearing>0.000</Bearing>\n`;
	xml += `    </PositionData>\n`;
	xml += `  </DrillPosPlan>\n`;

	// DrillPlan
	xml += `  <DrillPlan>\n`;
	xml += `    <NumberOfHoles>${iredesPoints.length}</NumberOfHoles>\n`;

	// Holes
	for (let i = 0; i < iredesPoints.length; i++) {
		const iredesPoint = iredesPoints[i];
		xml += `    <Hole>\n`;
		xml += `      <HoleId>${iredesPoint.holeID.trim()}</HoleId>\n`;
		xml += `      <HoleName>${iredesPoint.holeID.trim()}</HoleName>\n`;
		xml += `      <StartPoint>\n`;
		xml += `        <IR:PointX>${iredesPoint.startYLocation}</IR:PointX>\n`;
		xml += `        <IR:PointY>${iredesPoint.startXLocation}</IR:PointY>\n`;
		xml += `        <IR:PointZ>${iredesPoint.startZLocation}</IR:PointZ>\n`;
		xml += `      </StartPoint>\n`;
		xml += `      <EndPoint>\n`;
		xml += `        <IR:PointX>${iredesPoint.endYLocation}</IR:PointX>\n`;
		xml += `        <IR:PointY>${iredesPoint.endXLocation}</IR:PointY>\n`;
		xml += `        <IR:PointZ>${iredesPoint.endZLocation}</IR:PointZ>\n`;
		xml += `      </EndPoint>\n`;
		xml += `      <TypeOfHole>${iredesPoint.holeType.trim()}</TypeOfHole>\n`;
		xml += `      <DrillBitDia>${iredesPoint.holeDiameter}</DrillBitDia>\n`;
	}

	// Placeholder for the checksum with the string "0"
	const checksumPlaceholder = "0";

	// Closing the XML
	xml += `    <EquipmentData xmlns="">\n`;
	xml += `      <IR:OptionData />\n`;
	xml += `    </EquipmentData>\n`;
	xml += `  </DrillPlan>\n`;
	xml += `  <IR:GenTrailer>\n`;
	xml += `    <IR:FileCloseDate>${formattedDate}</IR:FileCloseDate>\n`;
	xml += `    <IR:ChkSum>${checksumPlaceholder}</IR:ChkSum>\n`;
	xml += `  </IR:GenTrailer>\n`;
	xml += `</DRPPlan>`;

	// Step 1: Calculate CRC32 checksum with the "0" as the initial checksum
	let checksum = crc32(xml.replace(checksumPlaceholder, "0"));

	// Step 2: Replace the "0" with the actual checksum
	xml = xml.replace(checksumPlaceholder, checksum);

	return xml;
}

function crc32(str) {
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

function decimalChecksum(str) {
	let checksum = 0;
	for (let i = 0; i < str.length; i++) {
		checksum += str.charCodeAt(i);
	}
	return checksum;
}
function calculateMD5Checksum(data) {
	const hash = CryptoJS.MD5(data);
	return hash.toString();
}

function calculateSHA1Checksum(data) {
	const hash = CryptoJS.SHA1(data);
	return hash.toString();
}

function calculateSHA256Checksum(data) {
	const hash = CryptoJS.SHA256(data);
	return hash.toString();
}

function calculateTimes(points) {
	//console.log("Calculating times...");
	try {
		const surfaces = {};
		holeTimes = {};

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

		return result;
	} catch (err) {
		console.log("Error in calculateTimes:", err);
	}
}

function updateSurfaceTimes(combinedHoleID, time, surfaces, holeTimes, visited = new Set()) {
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
// function delaunayContours(contourData, contourLevel, maxEdgeLength) {
// 	// Filter out points where holeTime is null
// 	const filteredContourData = contourData.filter(point => point.holeTime !== null);

// 	// Compute Delaunay triangulation
// 	const delaunay = d3.Delaunay.from(filteredContourData.map(point => [point.x, point.y]));
// 	const triangles = delaunay.triangles; // Access the triangles property directly

// 	const contourLines = [];

// 	for (let i = 0; i < triangles.length; i += 3) {
// 		const contourLine = [];

// 		for (let j = 0; j < 3; j++) {
// 			const p1 = contourData[triangles[i + j]];
// 			const p2 = contourData[triangles[i + (j + 1) % 3]];

// 			// Calculate distance between p1 and p2
// 			const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
// 			//If the distance is larger than 20 don't draw the line.
// 			if (distance <= maxEdgeLength && ((p1.z < contourLevel && p2.z >= contourLevel) || (p1.z >= contourLevel && p2.z < contourLevel))) {
// 				const point = interpolate(p1, p2, contourLevel);
// 				contourLine.push(point);
// 			}
// 		}

// 		if (contourLine.length === 2) {
// 			contourLines.push(contourLine);
// 		}
// 	}

// 	//console.log(contourLines);

// 	return contourLines;
// }
function delaunayContours(contourData, contourLevel, maxEdgeLength) {
	// Filter out points where holeTime is null
	const filteredContourData = contourData.filter((point) => point.holeTime !== null);

	// Compute Delaunay triangulation
	const delaunay = d3.Delaunay.from(filteredContourData.map((point) => [point.x, point.y]));
	const triangles = delaunay.triangles; // Access the triangles property directly

	const contourLines = [];
	directionArrows = []; // Initialize an array to store the arrows

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

		if (surfaceArea > 0.2) {
			// Store the arrow (start at the centroid, end at the calculated slope direction)
			directionArrows.push([centroidX, centroidY, arrowEndX, arrowEndY, "goldenrod", firstMovementSize]);
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

	const interval = 1; // Keep every arrow
	directionArrows = directionArrows.filter((arrow, index) => index % interval === 0);

	// Return both contour lines and the newly created arrows
	return { contourLines, directionArrows };
}

//NOT IN USE - YET
function delaunayContourBurdenRelief(contourData, maxEdgeLength, angleOfInitiation) {
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

function interpolate(p1, p2, contourLevel) {
	const t = (contourLevel - p1.z) / (p2.z - p1.z);
	return {
		x: p1.x + t * (p2.x - p1.x),
		y: p1.y + t * (p2.y - p1.y)
	};
}

function simplifyLine(line, epsilon) {
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

function pointToLineDistanceSq(point, lineStart, lineEnd, lineDistSq) {
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

/**
 * Function to generate a Delaunay triangulation from a set of 2D points, and
 * filter out triangles with edges that are longer than a specified maximum edge length.
 * @param {Array} points the set of 2D points to triangulate
 * @param {number} maxEdgeLength the maximum edge length to allow
 * @returns {Array} an array of triangles, where each triangle is an array of 3 points,
 * each point being an array of 3 numbers (x, y, z)
 */
function delaunayTriangles(points, maxEdgeLength) {
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

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearCanvasWithNotification() {
	// Create and configure the modal
	const clearModal = new SimpleModal({
		modalId: "clearCanvasModal",
		title: "Clear Canvas",
		bodyText: "Are you sure? Continuing will clear the canvas. You will lose all unsaved data.",
		type: "warning",
		confirmText: "Yes",
		cancelText: "No",
		confirmCallback: function () {
			clearCanvas();
			clearLoadedData();
		},
		cancelCallback: function () {
			// Do nothing on cancel
			console.log("Canvas clearing canceled.");
		}
	});

	// Create and show the modal
	clearModal.createModal();
	clearModal.show();
}

/*** CODE TO DRAW POINTS FROM KAD DATA ***/
function drawKADPoints(x, y, z, strokeColour) {
	ctx.beginPath();
	ctx.arc(x, y, 2, 0, 2 * Math.PI);
	ctx.strokeStyle = strokeColour;
	ctx.fillStyle = strokeColour;
	ctx.stroke();
	ctx.fill();
}
//Draws an open polyline from the kadLinesArray
function drawKADLines(sx, sy, ex, ey, sz, ez, lineWidth, strokeColour) {
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.lineTo(ex, ey);
	ctx.strokeStyle = strokeColour;
	ctx.lineWidth = lineWidth;
	ctx.stroke();
}

function drawKADPolys(sx, sy, ex, ey, sz, ez, lineWidth, strokeColour) {
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.lineTo(ex, ey);
	ctx.strokeStyle = strokeColour;
	ctx.lineWidth = lineWidth;
	ctx.stroke();
	ctx.closePath();
}

//Draws a circle from the kadCirclesArray
function drawKADCircles(x, y, z, radius, lineWidth, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	//ctx.fillStyle = fillColour;
	//ctx.fill(); // fill the circle with the fill colour
	ctx.lineWidth = lineWidth;
	ctx.stroke(); // draw the circle border with the stroke colour
}
//Draws text from the kadTextsArray
function drawKADTexts(x, y, z, text, color) {
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
function drawTrack(lineStartX, lineStartY, lineEndX, lineEndY, strokeColour) {
	ctx.beginPath();
	ctx.moveTo(lineStartX, lineStartY);
	ctx.lineTo(lineEndX, lineEndY);
	ctx.strokeStyle = strokeColour;
	ctx.stroke();
}

function drawHoleToe(x, y, fillColour, strokeColour, radius) {
	ctx.beginPath();
	// Use the toeSizeInMeters directly to set the radius
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = fillColour;
	ctx.strokeStyle = strokeColour;
	ctx.stroke();
	ctx.fill();
}

function drawHole(x, y, radius, fillColour, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = fillColour;
	ctx.fill(); // fill the circle with the fill colour
	ctx.lineWidth = 2;
	ctx.stroke(); // draw the circle border with the stroke colour
}
//draw an X shape with the intersection of the lines at x,y and the length of the lines being the radius of the drawHole function
function drawDummy(x, y, radius, strokeColour) {
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
function drawNoDiameterHole(x, y, sideLength, strokeColour) {
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

function drawHiHole(x, y, radius, fillColour, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = fillColour;
	ctx.fill(); // fill the circle with the fill colour
	ctx.lineWidth = 5;
	ctx.stroke(); // draw the circle border with the stroke colour
}

function drawExplosion(x, y, spikes, outerRadius, innerRadius, colour1, colour2) {
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

function drawHexagon(x, y, sideLength, fillColour, strokeColour) {
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
function drawText(x, y, text, color) {
	ctx.font = parseInt(currentFontSize - 2) + "px Arial";
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
}
// Right-align the text by calculating the text width
function drawRightAlignedText(x, y, text, color) {
	ctx.font = parseInt(currentFontSize - 2) + "px Arial";
	const textWidth = ctx.measureText(text).width;
	ctx.fillStyle = color;
	// Draw the text at an x position minus the text width for right alignment
	drawText(x - textWidth, y, text, color);
}

function drawDirectionArrow(startX, startY, endX, endY, fillColour, strokeColour, connScale) {
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

function drawArrow(startX, startY, endX, endY, color, connScale) {
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

function drawArrowDelayText(startX, startY, endX, endY, color, text) {
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

function drawDelauanySlopeMap(triangles, centroid, strokeColour) {
	ctx.strokeStyle = strokeColour;
	ctx.fillStyle = fillColour;
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
function drawDelauanyBurdenRelief(triangles, centroid, strokeColour) {
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

function calculateTriangleCentroid(triangle) {
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
function drawReliefLegend(strokecolour) {
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

function drawTriangleAngleText(triangle, centroid, strokeColour) {
	const triangleCentroid = calculateTriangleCentroid(triangle);
	let maxSlopeAngle = getDipAngle(triangle);
	drawText((triangleCentroid.x - centroid.x) * currentScale + canvas.width / 2, (-triangleCentroid.y + centroid.y) * currentScale + canvas.height / 2, parseFloat(maxSlopeAngle).toFixed(1), strokeColour);
}

function drawTriangleBurdenReliefText(triangle, centroid, strokeColour) {
	const triangleCentroid = calculateTriangleCentroid(triangle);
	let burdenRelief = getBurdenRelief(triangle);
	drawText((triangleCentroid.x - centroid.x) * currentScale + canvas.width / 2, (-triangleCentroid.y + centroid.y) * currentScale + canvas.height / 2, parseFloat(burdenRelief).toFixed(1), strokeColour);
}

function getAngleBetweenEdges(edge1, edge2) {
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

function getDipAngle(triangle) {
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

function getEdgeSlopeAngle(p1, p2) {
	const dx = p2[0] - p1[0];
	const dy = p2[1] - p1[1];
	const dz = p2[2] - p1[2]; // Consider the z-axis difference for vertical deviation
	const slopeAngleRadians = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy));
	const slopeAngleDegrees = (slopeAngleRadians * 180) / Math.PI;
	return slopeAngleDegrees;
}

function getAngleBetweenPoints(p1, p2) {
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

function getBurdenRelief(triangle) {
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

function drawMousePosition(x, y) {
	ctx.strokeStyle = strokeColour;
	ctx.beginPath();
	ctx.rect(x - 7, y - 7, 14, 14);
	ctx.lineWidth = 1;
	ctx.stroke();
}

function getClickedHole(clickX, clickY) {
	// Adjust the click coordinates based on the current scale and centroid
	const adjustedX = (clickX - canvas.width / 2) / currentScale + centroidX;
	const adjustedY = -(clickY - canvas.height / 2) / currentScale + centroidY; // Invert the Y-coordinate
	// Calculate the distance threshold based on the scale factor

	//Create a constant called thresold set it to  (10/(currentScale/2).  If the value of thresold is less than 0.1 then set it to 0.1 else if it is greater than 2 set it to 2 else set it to 10/currentScale/2
	let threshold = 10 / (currentScale / 2);
	if (threshold > 0.2 && threshold <= 1.5) {
		10 / (currentScale / 2);
	} else if (threshold > 1.5) {
		threshold = 1.5;
	} else if (threshold < 0.2) {
		threshold = 0.2;
	}

	//console.log("Threshold: " + threshold);
	//console.log("Current Scale: " + currentScale);

	for (let i = 0; i < points.length; i++) {
		let point = points[i];
		let holeX = point.startXLocation;
		let holeY = point.startYLocation;
		let currentEntity = point.entity;

		let distance = Math.sqrt(Math.pow(holeX - adjustedX, 2) + Math.pow(holeY - adjustedY, 2));
		if (distance > threshold) {
			selectedHole = null; // Reset the selected hole ID
		}
	}
	if (isAddingConnector || isAddingMultiConnector) {
		// Loop through the points array to find the clicked hole
		for (let i = 0; i < points.length; i++) {
			let point = points[i];
			let holeX = point.startXLocation;
			let holeY = point.startYLocation;

			// Calculate the distance between the clicked point and the hole
			let distance = Math.sqrt(Math.pow(holeX - adjustedX, 2) + Math.pow(holeY - adjustedY, 2));

			// Check if the distance is within the threshold
			if (distance <= threshold) {
				//Remove this if statement if the if & if else doesn't work
				if (firstSelectedHole == null) {
					firstSelectedHole = point;
					secondSelectedHole = null;
				} else if (secondSelectedHole == null && firstSelectedHole != point && point != null) {
					secondSelectedHole = point;
					firstSelectedHole = null;
				} else {
					firstSelectedHole = null;
					secondSelectedHole = point;
				}
				return point; // Return the clicked hole
			}
		}
		//calculateTimes(points);
	} else if (!selectionMode && isMeasureRecording) {
		for (let i = 0; i < points.length; i++) {
			let point = points[i];
			let holeX = point.startXLocation;
			let holeY = point.startYLocation;

			let distance = Math.sqrt(Math.pow(holeX - adjustedX, 2) + Math.pow(holeY - adjustedY, 2));

			if (distance <= threshold) {
				selectedHole = point; // Update the selected hole ID

				//

				drawData(points, selectedHole);
				return point; // Return the clicked hole
			}
		}
	} else if (!selectionMode && (isDiameterEditing || isLengthEditing || isTypeEditing || isAngleEditing || isBearingEditing || isEastingEditing || isNorthingEditing || isElevationEditing || isDeletingHole || isBlastNameEditing)) {
		for (let i = 0; i < points.length; i++) {
			let point = points[i];
			let holeX = point.startXLocation;
			let holeY = point.startYLocation;
			let holeXEnd = point.endXLocation;
			let holeYEnd = point.endYLocation;

			let distance = Math.sqrt(Math.pow(holeX - adjustedX, 2) + Math.pow(holeY - adjustedY, 2));

			if (distance <= threshold) {
				selectedHole = point; // Update the selected hole ID
				// Update slider attributes here
				let holeNorthingSlider = document.getElementById("holeNorthingSlider");
				let holeEastingSlider = document.getElementById("holeEastingSlider");
				let holeElevationSlider = document.getElementById("holeElevationSlider");
				let holeLengthSlider = document.getElementById("holeLengthSlider");
				let holeDiameterSlider = document.getElementById("holeDiameterSlider");
				let holeAngleSlider = document.getElementById("holeAngleSlider");
				let holeBearingSlider = document.getElementById("holeBearingSlider");

				// Update slider attributes here

				holeEastingSlider.min = point.startXLocation - 20;
				holeEastingSlider.max = point.startXLocation + 20;
				holeEastingSlider.step = 0.1;

				holeNorthingSlider.min = point.startYLocation - 20;
				holeNorthingSlider.max = point.startYLocation + 20;
				holeNorthingSlider.step = 0.1;
				// Update slider attributes here

				holeElevationSlider.min = point.startZLocation - 20;
				holeElevationSlider.max = point.startZLocation + 20;
				holeElevationSlider.step = 0.1;

				//Length
				holeLengthSlider.step = 0.1;

				// Update slider attributes here
				holeAngleSlider.step = 1;

				// Update slider attributes here
				holeDiameterSlider.step = 1;

				// Update slider attributes here
				holeBearingSlider.step = 0.5;

				holeEastingSlider.value = point.startXLocation;
				holeNorthingSlider.value = point.startYLocation;
				holeElevationSlider.value = point.startZLocation;
				holeLengthSlider.value = point.holeLengthCalculated;
				holeDiameterSlider.value = point.holeDiameter;
				holeAngleSlider.value = point.holeAngle;
				holeBearingSlider.value = point.holeBearing;

				holeEastingLabel.textContent = "Hole Easting (X) : " + parseFloat(point.startXLocation).toFixed(2) + "mE";
				holeNorthingLabel.textContent = "Hole Northing (Y): " + parseFloat(point.startYLocation).toFixed(2) + "mN";
				holeElevationLabel.textContent = "Hole Elevation (Z) : " + parseFloat(point.startZLocation).toFixed(2) + "m";
				holeDiameterLabel.textContent = "Hole Diameter: " + parseFloat(point.holeDiameter).toFixed(0) + "mm";
				holeLengthLabel.textContent = "Hole Length: " + parseFloat(point.holeLengthCalculated).toFixed(1) + "m";
				holeAngleLabel.textContent = "Hole Angle: " + parseFloat(point.holeAngle).toFixed(0) + "\u00B0";
				holeBearingLabel.textContent = "Hole Bearing: " + parseFloat(point.holeBearing).toFixed(1) + "\u00B0";
				drawData(points, selectedHole);
				return point; // Return the clicked hole
			}
		}
		if (isDisplayingContours) {
			try {
				const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);
			} catch (error) {
				console.warn("Error calculating contour lines:", error);
			}

			// directionArrows now contains the arrow data for later drawing
		}
		if (isDisplayingSlopeTriangles) {
			try {
				[resultTriangles, reliefTriangles] = delaunayTriangles(points, maxEdgeLength);
			} catch (error) {
				console.warn("Error calculating Delaunay triangles:", error);
			}
		}
		if (isDisplayingReliefTriangles) {
			try {
				[resultTriangles, reliefTriangles] = delaunayTriangles(points, maxEdgeLength);
			} catch (error) {
				console.warn("Error calculating Delaunay triangles:", error);
			}
		}
		if (isDisplayingDirectionArrows) {
			try {
				const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);
			} catch (error) {
				console.warn("Error calculating contour lines:", error);
			}
		}
		// If no hole is clicked or found within the threshold
		// Reset only the firstSelectedHole
		firstSelectedHole = null;
	}
	return null; // Return null if no hole is clicked
}

function getMultipleClickedHoles(clickX, clickY) {
	if (!selectionMode) {
		return selectedMultipleHoles;
	}

	const adjustedX = (clickX - canvas.width / 2) / currentScale + centroidX;
	const adjustedY = -(clickY - canvas.height / 2) / currentScale + centroidY;
	let threshold = Math.max(Math.min(10 / (currentScale / 2), 1.5), 0.2);

	let holesWithinThreshold = [];
	for (let i = 0; i < points.length; i++) {
		let point = points[i];
		let distance = Math.sqrt((point.startXLocation - adjustedX) ** 2 + (point.startYLocation - adjustedY) ** 2);
		if (distance < threshold) {
			holesWithinThreshold.push(point);
		}
	}

	holesWithinThreshold.forEach((hole) => {
		if (!selectedMultipleHoles.includes(hole)) {
			selectedMultipleHoles.push(hole);
			drawData(points, selectedHole);
		} else {
			selectedMultipleHoles = selectedMultipleHoles.filter((selectedHole) => selectedHole !== hole);
			// Add UI feedback for deselection here
		}
	});

	let eastingSum = 0;
	let northingSum = 0;
	let elevationSum = 0;
	let lengthSum = 0;
	let diameterSum = 0;
	let angleSum = 0;
	let bearingSum = 0;
	let eastingAverage = 0;
	let northingAverage = 0;
	let elevationAverage = 0;
	let lengthAverage = 0;
	let diameterAverage = 0;
	let angleAverage = 0;
	let bearingAverage = 0;

	if (isDiameterEditing || isLengthEditing || isTypeEditing || isAngleEditing || isBearingEditing || isEastingEditing || isNorthingEditing || isElevationEditing || isDeletingHole || isBlastNameEditing) {
		console.log("Selected Multiple Holes: ", selectedMultipleHoles);
		selectedMultipleHoles.forEach((hole) => {
			// Average the values of the selected holes in the selectedMultipleHoles array
			// Update slider attributes with the averaged values for each attribute
			// Update the UI labels with the averaged values for each attribute
			//console.log(selectedMultipleHoles);
			eastingSum += parseFloat(hole.startXLocation);
			northingSum += parseFloat(hole.startYLocation);
			elevationSum += parseFloat(hole.startZLocation);
			lengthSum += parseFloat(hole.holeLengthCalculated);
			diameterSum += parseFloat(hole.holeDiameter);
			angleSum += parseFloat(hole.holeAngle);
			bearingSum += parseFloat(hole.holeBearing);

			//console.log("Sums: \n   ", eastingSum, "\n   ", northingSum, "\n   ", elevationSum, "\n   ", lengthSum, "\n   ", diameterSum, "\n   ", angleSum, "\n   ", bearingSum);
			//console.log("Length: " + selectedMultipleHoles.length);

			eastingAverage = selectedMultipleHoles.length > 1 ? parseFloat(eastingSum) / parseInt(selectedMultipleHoles.length) : parseFloat(eastingSum);
			northingAverage = selectedMultipleHoles.length > 1 ? parseFloat(northingSum) / parseInt(selectedMultipleHoles.length) : parseFloat(northingSum);
			elevationAverage = selectedMultipleHoles.length > 1 ? parseFloat(elevationSum) / parseInt(selectedMultipleHoles.length) : parseFloat(elevationSum);
			lengthAverage = selectedMultipleHoles.length > 1 ? parseFloat(lengthSum) / parseInt(selectedMultipleHoles.length) : parseFloat(lengthSum);
			diameterAverage = selectedMultipleHoles.length > 1 ? parseFloat(diameterSum) / parseInt(selectedMultipleHoles.length) : parseFloat(diameterSum);
			angleAverage = selectedMultipleHoles.length > 1 ? parseFloat(angleSum) / parseInt(selectedMultipleHoles.length) : parseFloat(angleSum);
			bearingAverage = selectedMultipleHoles.length > 1 ? parseFloat(bearingSum) / parseInt(selectedMultipleHoles.length) : parseFloat(bearingSum);

			//console.log("Averages: \n   x", eastingAverage, "\n   y", northingAverage, "\n   z", elevationAverage, "\n   l", lengthAverage, "\n   d", diameterAverage, "\n   a", angleAverage, "\n   b", bearingAverage);

			holeEastingLabel.textContent = "Hole Easting av(X) : " + parseFloat(eastingAverage).toFixed(2) + "mE";
			holeNorthingLabel.textContent = "Hole Northing av(Y): " + parseFloat(northingAverage).toFixed(2) + "mN";
			holeElevationLabel.textContent = "Hole Elevation av(Z) : " + parseFloat(elevationAverage).toFixed(2) + "m";
			holeDiameterLabel.textContent = "Hole Diameter: " + parseFloat(diameterAverage).toFixed(0) + "mm";
			holeLengthLabel.textContent = "Hole Length: " + parseFloat(lengthAverage).toFixed(1) + "m";
			holeAngleLabel.textContent = "Hole Angle: " + parseFloat(angleAverage).toFixed(0) + "\u00B0";
			holeBearingLabel.textContent = "Hole Bearing: " + parseFloat(bearingAverage).toFixed(1) + "\u00B0";
			//set the min max range to a value either side the average value
			holeEastingSlider.min = eastingAverage - 20;
			holeEastingSlider.max = eastingAverage + 20;
			holeNorthingSlider.min = northingAverage - 20;
			holeNorthingSlider.max = northingAverage + 20;
			holeElevationSlider.min = elevationAverage - 20;
			holeElevationSlider.max = elevationAverage + 20;
			//set the value of the slider
			holeEastingSlider.value = eastingAverage;
			holeNorthingSlider.value = northingAverage;
			holeElevationSlider.value = elevationAverage;
			holeLengthSlider.value = lengthAverage;
			holeDiameterSlider.value = diameterAverage;
			holeAngleSlider.value = angleAverage;
			holeBearingSlider.value = bearingAverage;
			//console.log("Averages 2: \n   x", eastingAverage, "\n   y", northingAverage, "\n   z", elevationAverage, "\n   l", lengthAverage, "\n   d", diameterAverage, "\n   a", angleAverage, "\n   b", bearingAverage);
		});
	}

	return selectedMultipleHoles;
}

function getJSColourHex() {
	const colourElement = document.getElementById("connectorColour");
	// Get the JSColor instance from the element
	const jsColorInstance = colourElement.jscolor;
	// Get the color value
	const colourHex = jsColorInstance.toHEXString(); // This will get the color in HEX format, e.g., "#FF0000"
	return colourHex;
}
function getJSColourHexDrawing() {
	const colourElement = document.getElementById("drawingColour");
	// Get the JSColor instance from the element
	const jsColorInstance = colourElement.jscolor;
	// Get the color value
	const colourHex = jsColorInstance.toHEXString(); // This will get the color in HEX format, e.g., "#FF0000"
	return colourHex;
}

function handleConnectorClick(event) {
	// Get the click/touch coordinates relative to the canvas
	const rect = canvas.getBoundingClientRect();
	const clickX = event.clientX - rect.left;
	const clickY = event.clientY - rect.top;
	const clickedHole = getClickedHole(clickX, clickY);
	if (isAddingConnector) {
		if (clickedHole) {
			if (!fromHoleStore) {
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
				// TODO: Update UI or provide feedback for selecting fromHole
			} else {
				selectedHole = clickedHole;
				const delay = parseInt(document.getElementById("delay").value);
				const clickedHoleIndex = points.findIndex((point) => point === clickedHole);

				if (clickedHoleIndex !== -1) {
					// Use the new combined format for fromHoleID
					points[clickedHoleIndex].fromHoleID = `${fromHoleStore.entityName}:::${fromHoleStore.holeID}`;
					points[clickedHoleIndex].timingDelayMilliseconds = delay;
					points[clickedHoleIndex].colourHexDecimal = getJSColourHex();
				}
				fromHoleStore = null;
				const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

				// directionArrows now contains the arrow data for later drawing

				drawData(points, selectedHole);
			}
		}
	} else if (isAddingMultiConnector) {
		if (clickedHole) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
				// TODO: Update UI or provide feedback for selecting fromHole
			} else {
				const selectedHole = clickedHole;
				const pointsInLine = getPointsInLine(fromHoleStore, selectedHole);
				if (pointsInLine.length > 0) {
					connectPointsInLine(pointsInLine);
				}
				// Reset the fromHole and exit add connector mode
				fromHoleStore = null;

				const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

				// directionArrows now contains the arrow data for later drawing

				drawData(points, selectedHole);
				//console.log("centroidX: " + centroidX + " centroidY: " + centroidY);
			}
		}
	}
}

function getPointsInLine(startPoint, endPoint, tolerance) {
	const pointsInLine = [];
	tolerance = connectAmount;
	const dx = endPoint.startXLocation - startPoint.startXLocation;
	const dy = endPoint.startYLocation - startPoint.startYLocation;
	const length = Math.sqrt(dx * dx + dy * dy);
	const dirX = dx / length;
	const dirY = dy / length;

	for (const point of points) {
		if (point !== startPoint && point !== endPoint) {
			const vecX = point.startXLocation - startPoint.startXLocation;
			const vecY = point.startYLocation - startPoint.startYLocation;
			const dotProduct = vecX * dirX + vecY * dirY;
			if (dotProduct >= 0 && dotProduct <= length) {
				const distanceToLine = Math.abs(vecX * dirY - vecY * dirX);
				if (distanceToLine <= tolerance) {
					pointsInLine.push(point);
				}
			}
		}
	}

	// Add start and end points to the array
	pointsInLine.unshift(startPoint);
	pointsInLine.push(endPoint);

	return pointsInLine;
}

function connectPointsInLine(pointsInLine) {
	// Debugging: Log initial pointsInLine
	//console.log("Initial pointsInLine:", pointsInLine.map(point => point.entityName + ":::" + point.holeID));

	// Sort points based on distance from the fromHoleStore
	pointsInLine.sort((a, b) => {
		const distanceA = calculateDistance(fromHoleStore, a);
		const distanceB = calculateDistance(fromHoleStore, b);
		return distanceA - distanceB;
	});

	// Debugging: Log sorted pointsInLine
	//console.log("Sorted pointsInLine:", pointsInLine.map(point => point.entityName + ":::" + point.holeID));

	let previousHoleID = `${fromHoleStore.entityName}:::${fromHoleStore.holeID}`;

	// Connect each point to the previous point
	for (let i = 1; i < pointsInLine.length; i++) {
		const point = pointsInLine[i];
		const pointIndex = points.findIndex((p) => p === point);

		if (pointIndex !== -1) {
			// Debugging: Log the connection being made
			//console.log("Connecting:", previousHoleID, "to", point.entityName + ":::" + point.holeID);

			points[pointIndex].fromHoleID = previousHoleID;
			points[pointIndex].timingDelayMilliseconds = parseInt(document.getElementById("delay").value);
			points[pointIndex].colourHexDecimal = getJSColourHex();
		}

		previousHoleID = `${point.entityName}:::${point.holeID}`;
	}
	//calculateTimes(points);
	// Debugging: Log final points after connection
	//console.log("Final points after connection:", points.map(point => point.entityName + ":::" + point.holeID + " connected to " + point.fromHoleID));
}

// Function to calculate the distance between two points
function calculateDistance(point1, point2) {
	const dx = point2.startXLocation - point1.startXLocation;
	const dy = point2.startYLocation - point1.startYLocation;
	return Math.sqrt(dx * dx + dy * dy);
}

let selectedPoint = null;

function getClickedPointInMap(map, clickX, clickY) {
	const adjustedX = (clickX - canvas.width / 2) / currentScale + centroidX;
	const adjustedY = -(clickY - canvas.height / 2) / currentScale + centroidY;
	let threshold = 10 / (currentScale / 2);
	//console.log("Threshold:", threshold); // Add this line for debugging
	let closestPoint = null;
	let minDistance = threshold;

	// Iterate over the keys of the map
	for (const entityName of map.keys()) {
		const entity = map.get(entityName);
		for (const point of entity.data) {
			const distance = Math.sqrt(Math.pow(point.pointXLocation - adjustedX, 2) + Math.pow(point.pointYLocation - adjustedY, 2));
			//console.log("Distance:", distance); // Add this line for debugging

			if (distance <= threshold && distance < minDistance) {
				closestPoint = point;
				minDistance = distance;
			}
		}
	}
	drawData(points, selectedHole);
	//console.log("Closest Point:", closestPoint); // Add this line for debugging
	return closestPoint;
}

function getClickedPoint(event) {
	// get the values from clicking in the canvas
	const rect = canvas.getBoundingClientRect();
	let clickX = event.clientX - rect.left;
	let clickY = event.clientY - rect.top;
	if (isNaN(event.clientX - rect.left) || isNaN(event.clientY - rect.top)) {
		// Handle the case when the values are NaN
		clickX = event.changedTouches[0].clientX - rect.left;
		clickY = event.changedTouches[0].clientY - rect.top;
	} else {
		// Proceed with the calculation using the valid values
		clickX = event.clientX - rect.left;
		clickY = event.clientY - rect.top;
	}
	worldX = (clickX - canvas.width / 2) / currentScale + centroidX;
	worldY = -(clickY - canvas.height / 2) / currentScale + centroidY;

	if (isDeletingPoint) {
		selectedPoint = getClickedPointInMap(kadPointsMap, clickX, clickY);
		drawData(points, selectedHole);
		return selectedPoint;
	}
	if (isDeletingLine) {
		selectedPoint = getClickedPointInMap(kadLinesMap, clickX, clickY);
		drawData(points, selectedHole);
		return selectedPoint;
	}
	if (isDeletingPoly) {
		selectedPoint = getClickedPointInMap(kadPolygonsMap, clickX, clickY);
		drawData(points, selectedHole);
		return selectedPoint;
	}
	if (isDeletingText) {
		selectedPoint = getClickedPointInMap(kadTextsMap, clickX, clickY);
		drawData(points, selectedHole);
		return selectedPoint;
	}
	if (isDeletingCircle) {
		selectedPoint = getClickedPointInMap(kadCirclesMap, clickX, clickY);
		drawData(points, selectedHole);
		return selectedPoint;
	}
	drawData(points, selectedHole);
	// If none of the flags match, return null
	return null;
}

function offsetObjectWithSelectedPoint(map, selectedPoint, direction, offsetAmount, checkForCrossover = false, extendIfNecessary = false) {
	if (selectedPoint) {
		const entityName = selectedPoint.entityName;
		const entityType = selectedPoint.entityType;

		// Create a new entity for the offset polyline
		const newEntity = {
			entityName: `${entityName}_offset`, // Modify this as needed
			entityType: entityType,
			data: []
		};

		let prevPoint = null;

		// Offset and check for crossovers if needed
		for (const point of selectedPoint.data) {
			let offsetX = point.pointXLocation;
			let offsetY = point.pointYLocation;

			if (direction === "right") {
				offsetX += offsetAmount;
			} else if (direction === "left") {
				offsetX -= offsetAmount;
			} else if (direction === "up") {
				offsetY -= offsetAmount;
			} else if (direction === "down") {
				offsetY += offsetAmount;
			}

			if (checkForCrossover && prevPoint) {
				// Check for crossover and shorten the segment if needed
				const distance = Math.sqrt(Math.pow(offsetX - prevPoint.pointXLocation, 2) + Math.pow(offsetY - prevPoint.pointYLocation, 2));

				if (distance > offsetAmount) {
					const ratio = offsetAmount / distance;
					offsetX = prevPoint.pointXLocation + (offsetX - prevPoint.pointXLocation) * ratio;
					offsetY = prevPoint.pointYLocation + (offsetY - prevPoint.pointYLocation) * ratio;
				}
			}

			// Add the offset point to the new entity
			newEntity.data.push({
				entityName: newEntity.entityName,
				entityType: newEntity.entityType,
				pointID: point.pointID, // Preserve point ID or modify as needed
				pointXLocation: offsetX,
				pointYLocation: offsetY,
				pointZLocation: point.pointZLocation,
				lineWidth: point.lineWidth,
				colour: point.colour
			});

			if (extendIfNecessary && prevPoint) {
				const distance = Math.sqrt(Math.pow(offsetX - prevPoint.pointXLocation, 2) + Math.pow(offsetY - prevPoint.pointYLocation, 2));

				if (distance > offsetAmount) {
					// Extend the line segment if points get further away after offsetting
					newEntity.data.push({
						entityName: newEntity.entityName,
						entityType: newEntity.entityType,
						pointID: point.pointID, // Preserve point ID or modify as needed
						pointXLocation: offsetX,
						pointYLocation: offsetY,
						pointZLocation: point.pointZLocation,
						lineWidth: point.lineWidth,
						colour: point.colour
					});
				}
			}

			prevPoint = point;
		}

		// Add the new entity to the appropriate map (line or poly)
		if (entityType === "poly") {
			kadPolygonsMap.set(newEntity.entityName, newEntity);
		} else if (entityType === "line") {
			kadLinesMap.set(newEntity.entityName, newEntity);
		}

		// Redraw the canvas or perform any other necessary updates
		drawData(points, selectedHole);

		// Return the newly created entity if needed
		return newEntity;
	}
}

function deleteSelectedPoint() {
	if (selectedPoint) {
		if (isDeletingPoint) {
			deletePointInMap(kadPointsMap, selectedPoint);
		} else if (isDeletingLine) {
			deletePointInMap(kadLinesMap, selectedPoint);
		} else if (isDeletingPoly) {
			deletePointInMap(kadPolygonsMap, selectedPoint);
		} else if (isDeletingText) {
			deletePointInMap(kadTextsMap, selectedPoint);
		} else if (isDeletingCircle) {
			deletePointInMap(kadCirclesMap, selectedPoint);
		}
	}
}

function deleteSelectedObject() {
	if (selectedPoint) {
		if (isDeletingPoint) {
			deleteObjectInMap(kadPointsMap, selectedPoint);
		} else if (isDeletingLine) {
			deleteObjectInMap(kadLinesMap, selectedPoint);
		} else if (isDeletingPoly) {
			deleteObjectInMap(kadPolygonsMap, selectedPoint);
		} else if (isDeletingText) {
			deleteObjectInMap(kadTextsMap, selectedPoint);
		} else if (isDeletingCircle) {
			deleteObjectInMap(kadCirclesMap, selectedPoint);
		}
	}
}

function deleteSelectedAll() {
	if (selectedPoint) {
		if (isDeletingPoint) {
			deleteAllInMap(kadPointsMap);
		} else if (isDeletingLine) {
			deleteAllInMap(kadLinesMap);
		} else if (isDeletingPoly) {
			deleteAllInMap(kadPolygonsMap);
		} else if (isDeletingText) {
			deleteAllInMap(kadTextsMap);
		} else if (isDeletingCircle) {
			deleteAllInMap(kadCirclesMap);
		}
	}
}

function deletePointInMap(map, pointToDelete) {
	for (const [entityName, entity] of map) {
		const dataIndex = entity.data.findIndex((point) => {
			return point.pointID === pointToDelete.pointID && point.entityName === entityName && point.pointXLocation === pointToDelete.pointXLocation && point.pointYLocation === pointToDelete.pointYLocation;
		});

		if (dataIndex !== -1) {
			entity.data.splice(dataIndex, 1);
			drawData(points, selectedHole);
			selectedPoint = null;
			break;
		}
	}
	drawData(points, selectedHole);
}

function deleteObjectInMap(map, pointToDelete) {
	for (const [entityName, entity] of map) {
		if (entity.data.includes(pointToDelete)) {
			// Delete the entire entity
			map.delete(entityName);
			drawData(points, selectedHole);
			selectedPoint = null;
			break;
		} else {
			drawData(points, selectedHole);
		}
	}
	drawData(points, selectedHole);
}

function deleteAllInMap(map) {
	map.clear();
	selectedPoint = null;
	drawData(points, selectedHole);
}
/*
function deleteSelectedHole() {
	if (isDeletingHole) {
		if (selectedHole !== null) {
			// Log selectedHole for debugging
			console.log("Selected Hole ID:", selectedHole.holeID + " in: " + selectedHole.entityName);

			// Find the selected holeID's entityName
			const selectedEntityName = points.find(point => point === selectedHole).entityName;
			console.log("Selected Entity Name:", selectedEntityName);

			// Delete the selected hole with the matching entityName and holeID
			const index = points.findIndex(point => point.entityName === selectedEntityName && point === selectedHole);

			if (index !== -1) {
				points.splice(index, 1);
				// Reset the selected holeID and entityName
				if (isRenumberingHoles) {
					console.log("Renumbering for Entity:", selectedEntityName);
					renumberHolesFunction(deleteRenumberStart, selectedEntityName);
					drawData(points, selectedHole);
				}
				selectedHole = null;
				// No need to reset selectedEntityName as it's derived from the points array
				// selectedEntityName = null;
				// Reset the fromHoleStore
				fromHoleStore = null;
				// Recalculate contour lines
			}

			delaunayTriangles(points, maxEdgeLength);
			calculateTimes(points);
			contourLinesArray = recalculateContours(points, deltaX, deltaY);
			drawData(points, selectedHole);
		} else {
			drawData(points, selectedHole);
		}
	}
}
*/
function deleteSelectedHole() {
	if (isDeletingHole && selectedHole !== null) {
		console.log("Deleting Hole ID:", selectedHole.holeID, "in:", selectedHole.entityName);

		// Filter out the selected hole
		points = points.filter((point) => point !== selectedHole);

		// Renumber holes if necessary
		if (isRenumberingHoles) {
			console.log("Renumbering for Entity:", selectedHole.entityName, "starting at:", deleteRenumberStart);
			renumberHolesFunction(deleteRenumberStart, selectedHole.entityName);
		}

		// Recalculate dependent data structures
		const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
		calculateTimes(points);
		const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

		// directionArrows now contains the arrow data for later drawing

		// Redraw the data
		drawData(points, null); // Pass null since the selected hole no longer exists

		// Reset selections
		selectedHole = null;
		fromHoleStore = null;
	}

	refreshPoints();
}
//function to delete holes that have the same entity name in both the points array and the map
function deleteSelectedPattern() {
	if (isDeletingHole) {
		if (selectedHole !== null) {
			// find the selected holeIDs entityName
			let entityNameToDelete = points.find((point) => point === selectedHole).entityName;

			// Remove holes with the same entityName from kadHolesMap
			for (const [entityName, entity] of kadHolesMap) {
				if (entityName === entityNameToDelete) {
					delete kadHolesMap.delete(entityName);
				}
			}

			// Remove holes with the same entityName from the points array
			points = points.filter((point) => point.entityName !== entityNameToDelete);

			// Reset the selected holeID
			selectedHole = null;
			// Reset the fromHoleStore
			fromHoleStore = null;
			// Recalculate contour lines
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing

			drawData(points, selectedHole);
		} else {
			drawData(points, selectedHole);
		}
	}
	refreshPoints();
}

//function to delete All Entities in the kadHolesMap and all the Entityies in the points array
function deleteSelectedAllPatterns() {
	if (isDeletingHole) {
		if (selectedHole !== null) {
			// Remove all holes from kadHolesMap
			kadHolesMap.clear();

			// Remove all holes from the points array
			points = [];

			// Reset the selected holeID
			selectedHole = null;
			// Reset the fromHoleStore
			fromHoleStore = null;
			// Recalculate contour lines
			const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
			calculateTimes(points);
			const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

			// directionArrows now contains the arrow data for later drawing

			drawData(points, selectedHole);
		} else {
			drawData(points, selectedHole);
		}
	}
}

function handleHoleDeletingClick(event) {
	if (isDeletingHole) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);

		if (clickedHole) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			} else {
				drawData(points, selectedHole);
			}
		}
	}
}
function renumberHolesFunction(startNumber, selectedEntityName) {
	console.log("Renumbering holes for Entity:", selectedEntityName);

	const oldToNewHoleIDMap = new Map();

	// Renumber holes and keep track of old to new IDs
	points.forEach((point) => {
		if (point.entityName === selectedEntityName) {
			oldToNewHoleIDMap.set(point.holeID, startNumber);
			point.holeID = startNumber++;
		}
	});

	// Update fromHoleID references
	points.forEach((point) => {
		if (point.fromHoleID) {
			const [entity, oldHoleID] = point.fromHoleID.split(":::");
			if (entity === selectedEntityName && oldToNewHoleIDMap.has(oldHoleID)) {
				point.fromHoleID = `${entity}:::${oldToNewHoleIDMap.get(oldHoleID)}`;
			}
		}
	});
	refreshPoints();
	drawData(points, selectedHole);
}

function handleHoleAddingClick(event) {
	if (isAddingHole) {
		// Get the click/touch coordinates relative to the canvas
		//const rect = canvas.getBoundingClientRect();
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		let clickX = event.clientX - rect.left;
		let clickY = event.clientY - rect.top;

		if (isNaN(event.clientX - rect.left) || isNaN(event.clientY - rect.top)) {
			// Handle the case when the values are NaN
			clickX = event.changedTouches[0].clientX - rect.left;
			clickY = event.changedTouches[0].clientY - rect.top;
		} else {
			// Proceed with the calculation using the valid values
			clickX = event.clientX - rect.left;
			clickY = event.clientY - rect.top;
		}
		worldX = (clickX - canvas.width / 2) / currentScale + centroidX;
		worldY = -(clickY - canvas.height / 2) / currentScale + centroidY;

		//console.log("worldX: " + worldX + " worldY: " + worldY);
	} else {
		worldX = null;
		worldY = null;
	}
}

function handleKADPointClick(event) {
	if (isDrawingPoint) {
		// get the values from clicking in the canvas
		const rect = canvas.getBoundingClientRect();
		let clickX = event.clientX - rect.left;
		let clickY = event.clientY - rect.top;
		if (isNaN(event.clientX - rect.left) || isNaN(event.clientY - rect.top)) {
			// Handle the case when the values are NaN
			clickX = event.changedTouches[0].clientX - rect.left;
			clickY = event.changedTouches[0].clientY - rect.top;
		} else {
			// Proceed with the calculation using the valid values
			clickX = event.clientX - rect.left;
			clickY = event.clientY - rect.top;
		}
		worldX = (clickX - canvas.width / 2) / currentScale + centroidX;
		worldY = -(clickY - canvas.height / 2) / currentScale + centroidY;
		addKADPoint();
	} else {
		worldX = null;
		worldY = null;
	}
}

// Function to add a point to the kadPointsMap
function addKADPoint() {
	if (isDrawingPoint) {
		// Create a new point object or use the existing one
		const entityType = "point";
		const pointID = kadPointsMap.has(entityName) ? kadPointsMap.get(entityName).data.length + 1 : 1;
		const pointXLocation = worldX;
		const pointYLocation = worldY;
		const pointZLocation = document.getElementById("drawingElevation").value;
		const colour = getJSColourHexDrawing();
		//console.log("pointColour: " + colour);

		if (createNewEntity) {
			entityName = "pointObject" + (kadPointsMap.size + 1);
			createNewEntity = false; // Set the flag to false after creating a new entity
		}

		const pointObject = {
			entityName: entityName, //0
			entityType: entityType, //1
			pointID: pointID, //2
			pointXLocation: pointXLocation, //3
			pointYLocation: pointYLocation, //4
			pointZLocation: pointZLocation, //5
			colour: colour //6
		};

		// Add the point to kadPointsMap
		if (!kadPointsMap.has(entityName)) {
			kadPointsMap.set(entityName, {
				name: entityName,
				entityType: entityType,
				data: []
			});
		}
		kadPointsMap.get(entityName).data.push(pointObject);
	}
	drawData(points, selectedHole);
	//console.log("kadPointsMap: ", kadPointsMap);
}

function handleKADLineClick(event) {
	if (isDrawingLine) {
		// get the values from clicking in the canvas
		const rect = canvas.getBoundingClientRect();
		let clickX = event.clientX - rect.left;
		let clickY = event.clientY - rect.top;
		if (isNaN(event.clientX - rect.left) || isNaN(event.clientY - rect.top)) {
			// Handle the case when the values are NaN
			clickX = event.changedTouches[0].clientX - rect.left;
			clickY = event.changedTouches[0].clientY - rect.top;
		} else {
			// Proceed with the calculation using the valid values
			clickX = event.clientX - rect.left;
			clickY = event.clientY - rect.top;
		}
		worldX = (clickX - canvas.width / 2) / currentScale + centroidX;
		worldY = -(clickY - canvas.height / 2) / currentScale + centroidY;
		addKADLine();
	} else {
		worldX = null;
		worldY = null;
	}
}
// Function to add a point to the kadPointsMap
function addKADLine() {
	if (isDrawingLine) {
		// Create a new point object or use the existing one
		const entityType = "line";
		const pointID = kadLinesMap.has(entityName) ? kadLinesMap.get(entityName).data.length + 1 : 1;
		const pointXLocation = worldX;
		const pointYLocation = worldY;
		const pointZLocation = document.getElementById("drawingElevation").value;
		const lineWidth = document.getElementById("drawingLineWidth").value;
		const colour = getJSColourHexDrawing();
		//console.log("pointColour: " + colour);

		if (createNewEntity) {
			entityName = "lineObject" + (kadLinesMap.size + 1);
			createNewEntity = false; // Set the flag to false after creating a new entity
		}

		const lineObject = {
			entityName: entityName,
			entityType: entityType,
			pointID: pointID,
			pointXLocation: pointXLocation,
			pointYLocation: pointYLocation,
			pointZLocation: pointZLocation,
			lineWidth: lineWidth,
			colour: colour
		};

		// Add the point to kadPointsMap
		if (!kadLinesMap.has(entityName)) {
			kadLinesMap.set(entityName, {
				name: entityName,
				entityType: entityType,
				data: []
			});
		}
		kadLinesMap.get(entityName).data.push(lineObject);
	}
	drawData(points, selectedHole);
	console.log("kadLinesMap: ", kadLinesMap);
}

function handleKADPolyClick(event) {
	if (isDrawingPoly) {
		// get the values from clicking in the canvas
		const rect = canvas.getBoundingClientRect();
		let clickX = event.clientX - rect.left;
		let clickY = event.clientY - rect.top;
		if (isNaN(event.clientX - rect.left) || isNaN(event.clientY - rect.top)) {
			// Handle the case when the values are NaN
			clickX = event.changedTouches[0].clientX - rect.left;
			clickY = event.changedTouches[0].clientY - rect.top;
		} else {
			// Proceed with the calculation using the valid values
			clickX = event.clientX - rect.left;
			clickY = event.clientY - rect.top;
		}
		worldX = (clickX - canvas.width / 2) / currentScale + centroidX;
		worldY = -(clickY - canvas.height / 2) / currentScale + centroidY;
		addKADPoly();
	} else {
		worldX = null;
		worldY = null;
	}
}
// Function to add a point to the kadPointsMap
function addKADPoly() {
	if (isDrawingPoly) {
		// Create a new point object or use the existing one
		const entityType = "poly";
		const pointID = kadPolygonsMap.has(entityName) ? kadPolygonsMap.get(entityName).data.length + 1 : 1;
		const pointXLocation = worldX;
		const pointYLocation = worldY;
		const pointZLocation = document.getElementById("drawingElevation").value;
		const lineWidth = document.getElementById("drawingLineWidth").value;
		const colour = getJSColourHexDrawing();
		//console.log("pointColour: " + colour);

		if (createNewEntity) {
			entityName = "polyObject" + (kadPolygonsMap.size + 1);
			createNewEntity = false; // Set the flag to false after creating a new entity
		}

		const polyObject = {
			entityName: entityName,
			entityType: entityType,
			pointID: pointID,
			pointXLocation: pointXLocation,
			pointYLocation: pointYLocation,
			pointZLocation: pointZLocation,
			lineWidth: lineWidth,
			colour: colour
		};

		// Add the point to kadPointsMap
		if (!kadPolygonsMap.has(entityName)) {
			kadPolygonsMap.set(entityName, {
				name: entityName,
				entityType: entityType,
				data: []
			});
		}
		kadPolygonsMap.get(entityName).data.push(polyObject);
	}
	drawData(points, selectedHole);
	console.log("kadPolygonsMap: ", kadPolygonsMap);
}

function handleKADCircleClick(event) {
	if (isDrawingCircle) {
		// get the values from clicking in the canvas
		const rect = canvas.getBoundingClientRect();
		let clickX = event.clientX - rect.left;
		let clickY = event.clientY - rect.top;
		if (isNaN(event.clientX - rect.left) || isNaN(event.clientY - rect.top)) {
			// Handle the case when the values are NaN
			clickX = event.changedTouches[0].clientX - rect.left;
			clickY = event.changedTouches[0].clientY - rect.top;
		} else {
			// Proceed with the calculation using the valid values
			clickX = event.clientX - rect.left;
			clickY = event.clientY - rect.top;
		}
		worldX = (clickX - canvas.width / 2) / currentScale + centroidX;
		worldY = -(clickY - canvas.height / 2) / currentScale + centroidY;
		addKADCircle();
	} else {
		worldX = null;
		worldY = null;
	}
}
// Function to add a point to the kadPointsMap
function addKADCircle() {
	if (isDrawingCircle) {
		// Create a new point object or use the existing one
		const entityType = "circle";
		const pointID = kadCirclesMap.has(entityName) ? kadCirclesMap.get(entityName).data.length + 1 : 1;
		const pointXLocation = worldX;
		const pointYLocation = worldY;
		const pointZLocation = document.getElementById("drawingElevation").value;
		const radius = document.getElementById("drawingRadius").value;
		const lineWidth = document.getElementById("drawingLineWidth").value;
		const colour = getJSColourHexDrawing();
		//console.log("pointColour: " + colour);

		if (createNewEntity) {
			entityName = "circleObject" + (kadCirclesMap.size + 1);
			createNewEntity = false; // Set the flag to false after creating a new entity
		}

		const circleObject = {
			entityName: entityName,
			entityType: entityType,
			pointID: pointID,
			pointXLocation: pointXLocation,
			pointYLocation: pointYLocation,
			pointZLocation: pointZLocation,
			radius: radius,
			lineWidth: lineWidth,
			colour: colour
		};

		// Add the point to kadPointsMap
		if (!kadCirclesMap.has(entityName)) {
			kadCirclesMap.set(entityName, {
				name: entityName,
				entityType: entityType,
				data: []
			});
		}
		kadCirclesMap.get(entityName).data.push(circleObject);
	}
	drawData(points, selectedHole);
	console.log("kadCirclesMap: ", kadCirclesMap);
}

function handleKADTextClick(event) {
	if (isDrawingText) {
		// get the values from clicking in the canvas
		const rect = canvas.getBoundingClientRect();
		let clickX = event.clientX - rect.left;
		let clickY = event.clientY - rect.top;
		if (isNaN(event.clientX - rect.left) || isNaN(event.clientY - rect.top)) {
			// Handle the case when the values are NaN
			clickX = event.changedTouches[0].clientX - rect.left;
			clickY = event.changedTouches[0].clientY - rect.top;
		} else {
			// Proceed with the calculation using the valid values
			clickX = event.clientX - rect.left;
			clickY = event.clientY - rect.top;
		}
		worldX = (clickX - canvas.width / 2) / currentScale + centroidX;
		worldY = -(clickY - canvas.height / 2) / currentScale + centroidY;
		addKADText();
	} else {
		worldX = null;
		worldY = null;
	}
}

// Function to add a point to the kadPointsMap
function addKADText() {
	if (isDrawingText) {
		// Create a new point object or use the existing one
		const entityType = "text";
		const pointID = kadTextsMap.has(entityName) ? kadTextsMap.get(entityName).data.length + 1 : 1;
		const pointXLocation = worldX;
		const pointYLocation = worldY;
		const pointZLocation = document.getElementById("drawingElevation").value;
		let text = document.getElementById("drawingText").value;
		const colour = getJSColourHexDrawing();
		//console.log("pointColour: " + colour);

		// Escape double quotes in string literals
		text = text.replace(/"/g, '"');

		if (createNewEntity) {
			entityName = "textObject" + (kadTextsMap.size + 1);
			createNewEntity = false; // Set the flag to false after creating a new entity
		}

		const textObject = {
			entityName: entityName,
			entityType: entityType,
			pointID: pointID,
			pointXLocation: pointXLocation,
			pointYLocation: pointYLocation,
			pointZLocation: pointZLocation,
			text: text,
			colour: colour
		};

		// Add the point to kadPointsMap
		if (!kadTextsMap.has(entityName)) {
			kadTextsMap.set(entityName, {
				name: entityName,
				entityType: entityType,
				data: []
			});
		}
		kadTextsMap.get(entityName).data.push(textObject);
	}
	drawData(points, selectedHole);
	console.log("kadTextsMap: ", kadTextsMap);
}

// Using SweetAlert Library Create a popup that gets input from the user.
//Add a column selections system to be able to select the manny attributes of the AQM file
//Ignore, Angle, Azimuth, Instruction, Diameter, Material Type, Name, Blast, Pattern, Easting, Northing, Elevation
//Eleven Possible columns
function saveAQMPopup() {
	const savedAQMPopupSettings = JSON.parse(localStorage.getItem("savedAQMPopupSettings")) || {};
	let blastNameFromPoints = points[0].entityName;
	console.log("blastName: " + blastNameFromPoints);
	Swal.fire({
		title: "Export AQM file?",
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
            <div class="button-container-2col">
                <label class="labelWhite15" for="fileName">File Name</label>
                <input type="text" id="fileName" value="${blastNameFromPoints}_AQM" placeholder="File Name"/>
				<label class="labelWhite15" for="blastName">Blast Name</label>
                <input type="text" id="blastName" value="${blastNameFromPoints}" placeholder="Blast Name"/>
				<label class="labelWhite15" for="patternName">Pattern Name</label>
                <input type="text" id="patternName" value="${blastNameFromPoints}" placeholder="Pattern Name"/>
				<label class="labelWhite15" for="materialType">Material Type</label>
				<input type="text" id="materialType" placeholder="Material Type" value="Material"/>
				<label class="labelWhite15" for="Instruction">Instruction</label>
				<input type="text" id="instruction" placeholder="Instruction" value="Instruction" />
            </div>
			<label class="labelWhite12">AQM file outputs Select the column order below:</label><br>
			<div class="button-container-2col">
				<label class="labelWhite12">Use hole type as instruction:</label>
				<input type="checkbox" id="useHoleTypeAsInstruction" name="useHoleTypeAsInstruction" value="useHoleTypeAsInstruction">
				<label class="labelWhite12">Write Ignore Columns:</label>
				<input type="checkbox" id="writeIgnoreColumn" name="writeIgnoreColumn" value="writeIgnoreColumn" checked="true">
				<label class="labelWhite12">Column 1:</label>
				<select id="column1Dropdown">
					<option value="Angle">Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast" selected>Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern" selected>Pattern</option>
				</select>
				<label class="labelWhite12">Column 2:</label>
				<select id="column2Dropdown">
					<option value="Angle">Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast" selected>Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
				<label class="labelWhite12">Column 3:</label>
				<select id="column3Dropdown">
					<option value="Angle">Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast">Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name" selected>Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
				<label class="labelWhite12">Column 4:</label>
				<select id="column4Dropdown">
					<option value="Angle">Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast">Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting" selected>Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
				<label class="labelWhite12">Column 5:</label>
				<select id="column5Dropdown">
					<option value="Angle">Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast">Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing" selected>Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
				<label class="labelWhite12">Column 6:</label>
				<select id="column6Dropdown">
					<option value="Angle">Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast">Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation" selected>Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
				<label class="labelWhite12">Column 7:</label>
				<select id="column7Dropdown">
					<option value="Angle" selected>Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast">Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
				<label class="labelWhite12">Column 8:</label>
				<select id="column8Dropdown">	
					<option value="Angle">Angle</option>
					<option value="Azimuth" selected>Azimuth</option>
					<option value="Blast">Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
				<label class="labelWhite12">Column 9:</label>
				<select id="column9Dropdown">
					<option value="Angle">Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast">Blast</option>
					<option value="Diameter" selected>Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
				<label class="labelWhite12">Column 10:</label>
				<select id="column10Dropdown">
					<option value="Angle">Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast">Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction" selected>Instruction</option>
					<option value="Material Type">Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
				<label class="labelWhite12">Column 11:</label>
				<select id="column11Dropdown">
					<option value="Angle">Angle</option>
					<option value="Azimuth">Azimuth</option>
					<option value="Blast">Blast</option>
					<option value="Diameter">Diameter</option>
					<option value="Easting">Easting</option>
					<option value="Elevation">Elevation</option>
					<option value="Ignore">Ignore</option>
					<option value="Instruction">Instruction</option>
					<option value="Material Type" selected>Material Type</option>
					<option value="Name">Name</option>
					<option value="Northing">Northing</option>
					<option value="Pattern">Pattern</option>
				</select>
			</div>
        `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		},
		preConfirm: () => {
			// Get user input values
			const fileNameInput = document.getElementById("fileName");
			const blastNameInput = document.getElementById("blastName");
			const patternNameInput = document.getElementById("patternName");
			const materialTypeInput = document.getElementById("materialType");
			const instructionInput = document.getElementById("instruction");
			const useHoleTypeAsInstructionInput = document.getElementById("useHoleTypeAsInstruction");
			const writeIgnoreColumnInput = document.getElementById("writeIgnoreColumn");
			const column1Dropdown = document.getElementById("column1Dropdown");
			const column2Dropdown = document.getElementById("column2Dropdown");
			const column3Dropdown = document.getElementById("column3Dropdown");
			const column4Dropdown = document.getElementById("column4Dropdown");
			const column5Dropdown = document.getElementById("column5Dropdown");
			const column6Dropdown = document.getElementById("column6Dropdown");
			const column7Dropdown = document.getElementById("column7Dropdown");
			const column8Dropdown = document.getElementById("column8Dropdown");
			const column9Dropdown = document.getElementById("column9Dropdown");
			const column10Dropdown = document.getElementById("column10Dropdown");
			const column11Dropdown = document.getElementById("column11Dropdown");

			const fileNameValue = fileNameInput.value;
			const blastName = blastNameInput.value;
			const patternName = patternNameInput.value;
			const materialType = materialTypeInput.value;
			const instruction = instructionInput.value;
			const useHoleTypeAsInstruction = useHoleTypeAsInstructionInput.checked;
			const writeIgnoreColumn = writeIgnoreColumnInput.checked;

			const column1Value = column1Dropdown.value;
			const column2Value = column2Dropdown.value;
			const column3Value = column3Dropdown.value;
			const column4Value = column4Dropdown.value;
			const column5Value = column5Dropdown.value;
			const column6Value = column6Dropdown.value;
			const column7Value = column7Dropdown.value;
			const column8Value = column8Dropdown.value;
			const column9Value = column9Dropdown.value;
			const column10Value = column10Dropdown.value;
			const column11Value = column11Dropdown.value;

			// Create the column order array
			let columnOrderArray = [column1Value, column2Value, column3Value, column4Value, column5Value, column6Value, column7Value, column8Value, column9Value, column10Value, column11Value];
			// Save the selected settings to localStorage
			savedAQMPopupSettings.fileNameValue = fileNameValue;
			savedAQMPopupSettings.blastName = blastName;
			savedAQMPopupSettings.patternName = patternName;
			savedAQMPopupSettings.materialType = materialType;
			savedAQMPopupSettings.instruction = instruction;
			savedAQMPopupSettings.useHoleTypeAsInstruction = useHoleTypeAsInstruction;
			savedAQMPopupSettings.writeIgnoreColumn = writeIgnoreColumn;
			savedAQMPopupSettings.columnOrderArray = columnOrderArray;
			localStorage.setItem("savedAQMPopupSettings", JSON.stringify(savedAQMPopupSettings));
		}
	}).then((result) => {
		if (result.isConfirmed) {
			// Get user input values
			const fileNameInput = document.getElementById("fileName");
			const fileNameValue = fileNameInput.value;
			const blastNameInput = document.getElementById("blastName");
			const blastName = blastNameInput.value;
			const patternNameInput = document.getElementById("patternName");
			const patternName = patternNameInput.value;
			const materialTypeInput = document.getElementById("materialType");
			const materialType = materialTypeInput.value;
			const instructionInput = document.getElementById("instruction");
			const instruction = instructionInput.value;
			if (fileNameValue === "") {
				// Show an alert to the user with a customized error button
				Swal.fire({
					title: "File Name is Null or Invalid",
					icon: "error",
					showCancelButton: false,
					confirmButtonText: "Error",
					customClass: {
						container: "custom-popup-container",
						title: "swal2-title",
						confirmButton: "cancel",
						content: "swal2-content",
						htmlContainer: "swal2-html-container",
						icon: "swal2-icon"
					}
				});
				return; // Exit the function
			}
			let useHoleTypeAsInstruction = document.getElementById("useHoleTypeAsInstruction").checked;
			let writeIgnoreColumn = document.getElementById("writeIgnoreColumn").checked;
			// Get selected values from the dropdowns
			const column1Dropdown = document.getElementById("column1Dropdown");
			const column2Dropdown = document.getElementById("column2Dropdown");
			const column3Dropdown = document.getElementById("column3Dropdown");
			const column4Dropdown = document.getElementById("column4Dropdown");
			const column5Dropdown = document.getElementById("column5Dropdown");
			const column6Dropdown = document.getElementById("column6Dropdown");
			const column7Dropdown = document.getElementById("column7Dropdown");
			const column8Dropdown = document.getElementById("column8Dropdown");
			const column9Dropdown = document.getElementById("column9Dropdown");
			const column10Dropdown = document.getElementById("column10Dropdown");
			const column11Dropdown = document.getElementById("column11Dropdown");
			const column1Value = column1Dropdown.value;
			const column2Value = column2Dropdown.value;
			const column3Value = column3Dropdown.value;
			const column4Value = column4Dropdown.value;
			const column5Value = column5Dropdown.value;
			const column6Value = column6Dropdown.value;
			const column7Value = column7Dropdown.value;
			const column8Value = column8Dropdown.value;
			const column9Value = column9Dropdown.value;
			const column10Value = column10Dropdown.value;
			const column11Value = column11Dropdown.value;
			// Create the column order array
			let columnOrderArray = [column1Value, column2Value, column3Value, column4Value, column5Value, column6Value, column7Value, column8Value, column9Value, column10Value, column11Value];
			// Convert the points to a CSV string using the selected column orders
			let aqm = convertPointsToAQMCSV(points, fileNameValue, blastName, patternName, materialType, instruction, useHoleTypeAsInstruction, writeIgnoreColumn, columnOrderArray);
			if (isIOS()) {
				// Create a Blob with the XML data
				const blob = new Blob([aqm], {
					type: "text/csv;charset=utf-8"
				});
				// Create a URL for the Blob
				const url = URL.createObjectURL(blob);
				// Create an anchor element with the download link
				const link = document.createElement("a");
				link.href = url;
				link.download = fileNameValue + ".aqm";
				link.textContent = "Click here to download";
				// Append the link to the document
				document.body.appendChild(link);
				// Programmatically trigger the click event on the link
				link.click();
				// Remove the link from the document
				document.body.removeChild(link);
			} else {
				// Create an invisible anchor element
				const link = document.createElement("a");
				link.style.display = "none";

				// Set the XML content as the "href" attribute
				link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(aqm);
				link.download = fileNameValue + ".aqm";

				// Append the link to the document
				document.body.appendChild(link);

				// Programmatically trigger the click event on the link
				link.click();

				// Remove the link from the document
				document.body.removeChild(link);
			}
		}
	});
	// Populate form fields with saved settings
	const fileNameInput = document.getElementById("fileName");
	const blastNameInput = document.getElementById("blastName");
	const patternNameInput = document.getElementById("patternName");
	const materialTypeInput = document.getElementById("materialType");
	const instructionInput = document.getElementById("instruction");
	const useHoleTypeAsInstructionInput = document.getElementById("useHoleTypeAsInstruction");
	const writeIgnoreColumnInput = document.getElementById("writeIgnoreColumn");
	const column1Dropdown = document.getElementById("column1Dropdown");
	const column2Dropdown = document.getElementById("column2Dropdown");
	const column3Dropdown = document.getElementById("column3Dropdown");
	const column4Dropdown = document.getElementById("column4Dropdown");
	const column5Dropdown = document.getElementById("column5Dropdown");
	const column6Dropdown = document.getElementById("column6Dropdown");
	const column7Dropdown = document.getElementById("column7Dropdown");
	const column8Dropdown = document.getElementById("column8Dropdown");
	const column9Dropdown = document.getElementById("column9Dropdown");
	const column10Dropdown = document.getElementById("column10Dropdown");
	const column11Dropdown = document.getElementById("column11Dropdown");
	// Add more dropdown elements as needed

	fileNameInput.value = savedAQMPopupSettings.fileNameValue || "";
	blastNameInput.value = savedAQMPopupSettings.blastName || "";
	patternNameInput.value = savedAQMPopupSettings.patternName || "";
	materialTypeInput.value = savedAQMPopupSettings.materialType || "";
	instructionInput.value = savedAQMPopupSettings.instruction || "";
	useHoleTypeAsInstructionInput.checked = savedAQMPopupSettings.useHoleTypeAsInstruction || false;
	writeIgnoreColumnInput.checked = savedAQMPopupSettings.writeIgnoreColumn || true;
	column1Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[0] : "Pattern";
	column2Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[1] : "Blast";
	column3Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[2] : "Name";
	column4Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[3] : "Easting";
	column5Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[4] : "Northing";
	column6Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[5] : "Elevation";
	column7Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[6] : "Angle";
	column8Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[7] : "Azimuth";
	column9Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[8] : "Diameter";
	column10Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[9] : "Instruction";
	column11Dropdown.value = savedAQMPopupSettings.columnOrderArray ? savedAQMPopupSettings.columnOrderArray[10] : "Material Type";
	// Set values for more dropdowns as needed
}

// Using SweetAlert Library Create a popup that gets input from the user.
function saveIREDESPopup() {
	let blastName = points[0].entityName;
	//console.log("Points" + points);
	console.log("blastName: " + blastName);
	Swal.fire({
		title: "Export IREDES file?",
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
      <div class="button-container-2col">
      <label class="labelWhite18" for="fileName">File Name</label>
      <input type="text" id="fileName" placeholder="File Name" value="${blastName}_XML"/>
			<label class="labelWhite18" for="planID">Drill Plan ID</label>
			<input type="text" id="planID" placeholder="Plan ID" value="${blastName}"/>
			<label class="labelWhite18" for="SiteID">Site ID</label>
			<input type="text" id="siteID" placeholder="Site ID" value="SiteName"/>
	        <label class="labelWhite18" for="holeOptions">Hole Options On (required for mwd)</label>
      		<input type="checkbox" id="holeOptions" name="holeOptions" value="1" checked="true">
	        <label class="labelWhite18" for="mwdOn">Set Measure While Drilling On</label>
      		<input type="checkbox" id="mwdOn" name="mwdOn" value="1" checked="true">
      		<label class="labelWhite18">Checksum Type:</label>
				<select id="chksumValue">
					<!-- <option value="DECIMAL" selected>DECIMAL</option> -->
					<option value="CRC32" selected>CRC32</option>
					<!-- <option value="MD5">MD5</option> -->
					<!-- <option value="SHA1">SHA1</option> -->
					<!-- <option value="SHA256">SHA256</option> -->
					<option value="ZERO">ZERO</option>
					<option value="NONE">NONE</option>
				</select>
      </div>
			<label class="labelWhite12">This is an XML file in the format of an Epiroc Drill Plan Export</label>
        `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	}).then((result) => {
		if (result.isConfirmed) {
			// Get user input values
			const fileNameInput = document.getElementById("fileName");
			const fileNameValue = fileNameInput.value;

			const planIDInput = document.getElementById("planID");
			const planIDValue = planIDInput.value;

			const siteIDInput = document.getElementById("siteID");
			const siteIDValue = siteIDInput.value;

			const holeOptionsInput = document.getElementById("holeOptions");
			const holeOptionsValue = holeOptionsInput.checked ? true : false;

			const mwdInput = document.getElementById("mwdOn");
			const mwdValue = mwdInput.checked ? true : false;

			const chksumInput = document.getElementById("chksumValue");
			const chksumValue = chksumInput.value;

			if (fileNameValue === "") {
				// Show an alert to the user with a customized error button
				Swal.fire({
					title: "File Name is Null or Invalid",
					icon: "error",
					showCancelButton: false,
					confirmButtonText: "Error",
					customClass: {
						container: "custom-popup-container",
						title: "swal2-title",
						confirmButton: "cancel",
						//cancelButton: "cancel",
						content: "swal2-content",
						htmlContainer: "swal2-html-container",
						icon: "swal2-icon"
					}
				});
				return; // Exit the function
			}

			if (planIDValue === "") {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid Plan ID",
					text: "Please enter a Drill Plan ID.",
					icon: "error"
				});
				return; // Exit the function
			}
			//site Id checks
			if (siteIDValue === "") {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid Site ID",
					text: "Please enter a Site ID.",
					icon: "error"
				});
				return; // Exit the function
			}

			// Generate the XML content using the convertPointsToIREDESXML function
			const xmlContent = convertPointsToIREDESXML(points, fileNameValue, planIDValue, siteIDValue, holeOptionsValue, mwdValue, chksumValue);

			if (isIOS()) {
				// Create a Blob with the XML data
				const blob = new Blob([xmlContent], {
					type: "text/xml;charset=utf-8"
				});

				// Create a URL for the Blob
				const url = URL.createObjectURL(blob);

				// Create an anchor element with the download link
				const link = document.createElement("a");
				link.href = url;

				link.download = fileNameValue + ".xml";
				link.textContent = "Click here to download";

				// Append the link to the document
				document.body.appendChild(link);

				// Programmatically trigger the click event on the link
				link.click();

				// Remove the link from the document
				document.body.removeChild(link);
			} else {
				// Create an invisible anchor element
				const link = document.createElement("a");
				link.style.display = "none";

				// Set the XML content as the "href" attribute
				link.href = "data:text/xml;charset=utf-8," + encodeURIComponent(xmlContent);
				link.download = fileNameValue + ".xml";

				// Append the link to the document
				document.body.appendChild(link);

				// Programmatically trigger the click event on the link
				link.click();

				// Remove the link from the document
				document.body.removeChild(link);
			}
		}
	});
}

// Using SweetAlert Library Create a popup that gets input from the user.
function addHolePopup() {
	//Retrieve the last enteredvalues from local storage
	let savedAddHolePopupSettings = JSON.parse(localStorage.getItem("savedAddHolePopupSettings")) || {};
	let lastValues = {
		blastName: savedAddHolePopupSettings.blastName || blastNameValue,
		useCustomHoleID: savedAddHolePopupSettings.useCustomHoleID || false,
		customHoleID: savedAddHolePopupSettings.customHoleID || "",
		elevation: savedAddHolePopupSettings.elevation || 0,
		diameter: savedAddHolePopupSettings.diameter || 115,
		type: savedAddHolePopupSettings.type || "Production",
		length: savedAddHolePopupSettings.length || 0,
		angle: savedAddHolePopupSettings.angle || 0,
		bearing: savedAddHolePopupSettings.bearing || 0
	};

	Swal.fire({
		title: "Add a hole to the Pattern?",
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
		<div class="button-container-2col">
			<label class="labelWhite18" for="blastName">Blast Name</label>
			<input type="text3" id="blastName" placeholder="Blast Name" value="${lastValues.blastName}" />
		  	<label class="labelWhite18" for="useCustomHoleID">Use Custom Hole ID</label>
		  	<input type="checkbox" id="useCustomHoleID" name="useCustomHoleID" ${lastValues.useCustomHoleID ? "checked" : ""}>
		  	<label class="labelWhite18" for="customHoleID">Hole ID</label>
		  	<input type="text3" id="customHoleID" placeholder="Custom Hole ID" value="${lastValues.customHoleID}" />
		  	<label class="labelWhite18" for="elevation">Start Z</label>
		  	<input type="number3" id="elevation" placeholder="Elevation" value="${lastValues.elevation}" inputmode="decimal" pattern="[0-9]*"/>
			<label class="labelWhite18" for="diameter">Diameter</label>
			<input type="number3" id="diameter" name="diameter" placeholder="Diameter" value="${lastValues.diameter}" step=1 min="0" max="1000" inputmode="decimal" pattern="[0-9]*"/>
			<label class="labelWhite18" for="type">Type</label>
			<input type="text3" id="type" name="type" placeholder="Type" value="${lastValues.type}"/>
		  	<label class="labelWhite18" for="length">Length</label>
		  	<input type="number3" id="length" placeholder="Length" value="${lastValues.length}" inputmode="decimal" pattern="[0-9]*"/>
		  	<label class="labelWhite18" for="angle">Angle</label>
		  	<input type="number3" id="angle" placeholder="Angle" value="${lastValues.angle}" min="0" max="60" inputmode="decimal" pattern="[0-9]*"/>
		  	<label class="labelWhite18" for="bearing">Bearing</label>
		  	<input type="number3" id="bearing" placeholder="Bearing" value="${lastValues.bearing}" inputmode="decimal" pattern="[0-9]*"/>
		  </div>
	  `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const useCustomHoleID = document.getElementById("useCustomHoleID").checked;
			const customHoleID = document.getElementById("customHoleID").value;

			const blastNameInput = document.getElementById("blastName");
			const blastNameValue = blastNameInput.value;
			if (blastNameValue === null || blastNameValue === "") {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid Blast Name",
					showCancelButton: true,
					showConfirmButton: false,
					html: `<label class="labelWhite18">Error parsing Blast Name</label>`,
					customClass: {
						container: "custom-popup-container",
						title: "swal2-title",
						cancelButton: "Try Again",
						content: "swal2-content",
						htmlContainer: "swal2-html-container",
						icon: "error"
					}
				});
				return; // Exit the function
			}

			//diameter checks
			const diameterInput = document.getElementById("diameter");
			const diameterValue = parseFloat(diameterInput.value);
			if (isNaN(diameterValue) || diameterValue < 0 || diameterValue > 1000) {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid Diameter",
					text: "Please enter an diameter between 0 and 1000 millimeters.",
					icon: "error"
				});
				return; // Exit the function
			}
			//type checks which is only text
			const typeInput = document.getElementById("type");
			const typeValue = typeInput.value;
			if (typeValue === null || typeValue === "") {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid Type",
					text: "Please enter a Type.",
					icon: "error"
				});
				return; // Exit the function
			}
			const elevationInput = document.getElementById("elevation");
			const elevationValue = parseFloat(elevationInput.value);
			if (isNaN(elevationValue) || elevationValue < -2000 || elevationValue > 8000) {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid Elevation",
					text: "Please enter an elevation between -2000 and 8000 meters.",
					icon: "error"
				});
				return; // Exit the function
			}
			const lengthInput = document.getElementById("length");
			const lengthValue = parseFloat(lengthInput.value);
			if (isNaN(lengthValue) || lengthValue < 0 || lengthValue > 100) {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid length",
					text: "Please enter an length between 0 and 100 meters.",
					icon: "error"
				});
				return; // Exit the function
			}
			const angleInput = document.getElementById("angle");
			const angleValue = parseFloat(angleInput.value);

			if (isNaN(angleValue) || angleValue < 0 || angleValue > 60) {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid Angle",
					text: "Please enter an angle between 0 and 60 degrees.",
					icon: "error"
				});
				return; // Exit the function
			}
			const bearingInput = document.getElementById("bearing");
			const bearingValue = parseFloat(bearingInput.value);

			if (isNaN(bearingValue) || bearingValue < 0 || bearingValue > 360) {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid Bearing",
					text: "Please enter an bearing between 0 and 360 degrees.",
					icon: "error"
				});
				return; // Exit the function
			}

			lastValues = {
				blastName: blastNameValue,
				useCustomHoleID: useCustomHoleID,
				customHoleID: customHoleID,
				elevation: elevationValue,
				diameter: diameterValue,
				type: typeValue,
				length: lengthValue,
				angle: angleValue,
				bearing: bearingValue
			};
			localStorage.setItem("savedAddHolePopupSettings", JSON.stringify(lastValues));

			//create a new hole
			addHole(useCustomHoleID, blastNameValue, customHoleID, worldX, worldY, elevationValue, diameterValue, typeValue, lengthValue, angleValue, bearingValue);
		} else {
			worldX = null;
			worldY = null;
		}
	});
}

function handlePatternAddingClick(event) {
	if (isAddingPattern) {
		// Get the click/touch coordinates relative to the canvas
		//const rect = canvas.getBoundingClientRect();
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		let clickX = event.clientX - rect.left;
		let clickY = event.clientY - rect.top;

		if (isNaN(event.clientX - rect.left) || isNaN(event.clientY - rect.top)) {
			// Handle the case when the values are NaN
			clickX = event.changedTouches[0].clientX - rect.left;
			clickY = event.changedTouches[0].clientY - rect.top;
		} else {
			// Proceed with the calculation using the valid values
			clickX = event.clientX - rect.left;
			clickY = event.clientY - rect.top;
		}
		worldX = (clickX - canvas.width / 2) / currentScale + centroidX;
		worldY = -(clickY - canvas.height / 2) / currentScale + centroidY;
		addPatternPopup(parseFloat(worldX.toFixed(3)), parseFloat(worldY.toFixed(3)));
		//console.log("worldX: " + worldX + " worldY: " + worldY);
	} else {
		worldX = null;
		worldY = null;
	}
}

// Using SweetAlert Library Create a popup that gets input from the user.
function addPatternPopup(worldX, worldY) {
	//Retrieve the last enteredvalues from local storage
	let savedAddPatternPopupSettings = JSON.parse(localStorage.getItem("savedAddPatternPopupSettings")) || {};
	let lastValues = {
		blastName: savedAddPatternPopupSettings.blastName || blastNameValue,
		nameTypeIsNumerical: savedAddPatternPopupSettings.nameTypeIsNumerical || true,
		rowOrientation: savedAddPatternPopupSettings.rowOrientation || 90.0,
		x: savedAddPatternPopupSettings.x || worldX,
		y: savedAddPatternPopupSettings.y || worldY,
		z: savedAddPatternPopupSettings.z || 100,
		diameter: savedAddPatternPopupSettings.diameter || 115,
		type: savedAddPatternPopupSettings.type || "Production",
		angle: savedAddPatternPopupSettings.angle || 0,
		bearing: savedAddPatternPopupSettings.bearing || 180,
		length: savedAddPatternPopupSettings.length || 6.2,
		spacingOffset: savedAddPatternPopupSettings.spacingOffset || 0.5,
		burden: savedAddPatternPopupSettings.burden || 3.0,
		spacing: savedAddPatternPopupSettings.spacing || 3.3,
		rows: savedAddPatternPopupSettings.rows || 6,
		holesPerRow: savedAddPatternPopupSettings.holesPerRow || 10
	};

	//${lastValues.}
	// Show loading spinner while the popup is created
	Swal.showLoading();

	// Create the SweetAlert popup
	Swal.fire({
		title: "Add a Pattern?",
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
		<div class="button-container-2col">
		  <label class="labelWhite18" for="blastName">Blast Name</label>
		  <input type="text3" id="blastName" name="blastName" placeholder="Blast Name" value="${lastValues.blastName}"/>
		  <label class="labelWhite18" for="nameTypeIsNumerical">Numerical Names</label>
		  <input type="checkbox" id="nameTypeIsNumerical" name="nameTypeIsNumerical" ${lastValues.nameTypeIsNumerical ? "checked" : ""}>
		  <label class="labelWhite18" for="rowOrientation">Orientation</label>
		  <input type="number3" id="rowOrientation" name="rowOrientation" placeholder="rowOrientation" value="${lastValues.rowOrientation}" step=0.1 min="0" max="359.999" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="x">Start X</label>
		  <input type="number3" id="x" name="x" placeholder="X" value="${worldX}" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="y">Start Y</label>
		  <input type="number3" id="y" name="y" placeholder="Y" value="${worldY}" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="z">Start Z</label>
		  <input type="number3" id="z" name="z" placeholder="Z" value="${lastValues.z}" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="diameter">Diameter</label>
		  <input type="number3" id="diameter" name="diameter" placeholder="Diameter" value="${lastValues.diameter}" step=1 min="0" max="1000" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="type">Type</label>
		  <input type="text3" id="type" name="type" placeholder="Type" value="${lastValues.type}"/>
		  <label class="labelWhite18" for="angle">Angle</label>
		  <input type="number3" id="angle" name="angle" placeholder="Angle" value="${lastValues.angle}" step="1" min="0" max="60" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="bearing">Bearing</label>
		  <input type="number3" id="bearing" name="bearing" placeholder="Bearing" value="${lastValues.bearing}" value="0.0" step=0.1 min="0" max="359.999" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="length">Length</label>
		  <input type="number3" id="length" name="length" placeholder="Length" value="${lastValues.length}" step="0.1" min="0.0" max="200" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="spacingOffset">Offset</label>
		  <input type="number3" id="spacingOffset" name="spacingOffset" placeholder="SpacingOffset" value="${lastValues.spacingOffset}" step="0.1" min="-1.0" max="1.0" inputmode="decimal" pattern="[0-9]*"/>
		  <div class="labelWhite12"  id="infolabel1" name="infolabel1">Offset Information: </div> 
		  <div class="labelWhite12"  id="infolabel2" name="infolabel2">Staggered = -0.5 or 0.5, Square = -1, 0, 1</div> 
		  <label class="labelWhite18" for="burden">Burden</label>
		  <input type="number3" id="burden" name="burden" placeholder="Burden" value="${lastValues.burden}" step="0.1" min="0.1" max="50" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="spacing">Spacing</label>
		  <input type="number3" id="spacing" name="spacing" placeholder="Spacing" value="${lastValues.spacing}" step="0.1" min="0.1" max="50" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="rows">Rows</label>
		  <input type="number3" id="rows" name="rows" placeholder="Rows" value="${lastValues.rows}" step="1" min="1" max="500" inputmode="decimal" pattern="[0-9]*"/>
		  <label class="labelWhite18" for="holesPerRow">Holes Per Row</label>
		  <input type="number3" id="holesPerRow" name="holesPerRow" placeholder="Per Row" value="${lastValues.holesPerRow}" step="1" min="1" max="500" inputmode="decimal" pattern="[0-9]*"/>
		</div>
	  `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	})
		.then((result) => {
			if (result.isConfirmed) {
				// Retrieve values from the input fields
				const entityName = document.getElementById("blastName").value;

				const offset = document.getElementById("spacingOffset").value;
				const nameTypeIsNumerical = document.getElementById("nameTypeIsNumerical").checked;
				const rowOrientation = parseFloat(document.getElementById("rowOrientation").value);
				const x = parseFloat(document.getElementById("x").value);
				const y = parseFloat(document.getElementById("y").value);
				const z = parseFloat(document.getElementById("z").value);
				const diameter = parseFloat(document.getElementById("diameter").value);
				const type = document.getElementById("type").value;
				const angle = parseFloat(document.getElementById("angle").value);
				const bearing = parseFloat(document.getElementById("bearing").value);
				const length = parseFloat(document.getElementById("length").value);
				const burden = parseFloat(document.getElementById("burden").value);
				const spacing = parseFloat(document.getElementById("spacing").value);
				const rows = parseInt(document.getElementById("rows").value);
				const holesPerRow = parseInt(document.getElementById("holesPerRow").value);

				//entityName checks
				if (entityName === null || entityName === "") {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Blast Name",
						text: "Please enter a Blast Name.",
						icon: "error"
					});
					return; // Exit the function
				}
				//offset checks
				if (isNaN(offset) || offset < -1 || offset > 1) {
					//show alert to user
					Swal.fire({
						title: "Invalid Offset",
						text: "Please enter an offset between -1 and 1.",
						icon: "error"
					});
					return; // Exit the function
				}
				//nameTypeIsNumerical checks
				if (nameTypeIsNumerical === null || nameTypeIsNumerical === "") {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Name Type",
						text: "Please enter a Name Type.",
						icon: "error"
					});
					return; // Exit the function
				}
				//rowOrientation checks
				if (isNaN(rowOrientation) || rowOrientation < 0 || rowOrientation > 359.999) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Row Orientation",
						text: "Please enter a row orientation between 0 and 359.999 degrees.",
						icon: "error"
					});
					return; // Exit the function
				}
				//x checks
				if (isNaN(x)) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid X",
						text: "Please enter an X value in meters.",
						icon: "error"
					});
					return; // Exit the function
				}
				//y checks
				if (isNaN(y)) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Y",
						text: "Please enter an Y value in meters.",
						icon: "error"
					});
					return; // Exit the function
				}
				//z checks
				if (isNaN(z)) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Z",
						text: "Please enter an Z value in meters.",
						icon: "error"
					});
					return; // Exit the function
				}
				//diameter checks
				if (isNaN(diameter) || diameter < 0 || diameter > 1000) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Diameter",
						text: "Please enter an diameter between 0 and 1000 millimeters.",
						icon: "error"
					});
					return; // Exit the function
				}
				//type checks which is only text
				if (type === null || type === "") {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Type",
						text: "Please enter a Type.",
						icon: "error"
					});
					return; // Exit the function
				}
				//angle checks
				if (isNaN(angle) || angle < 0 || angle > 60) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Angle",
						text: "Please enter an angle between 0 and 60 degrees.",
						icon: "error"
					});
					return; // Exit the function
				}
				//bearing checks
				if (isNaN(bearing) || bearing < 0 || bearing > 360) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Bearing",
						text: "Please enter an bearing between 0 and 360 degrees.",
						icon: "error"
					});
					return; // Exit the function
				}
				//length checks
				if (isNaN(length) || length < 0 || length > 200) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Length",
						text: "Please enter an length between 0 and 200 meters.",
						icon: "error"
					});
					return; // Exit the function
				}
				//burden checks
				if (isNaN(burden) || burden < 0.1 || burden > 50) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Burden",
						text: "Please enter an burden between 0.1 and 50 meters.",
						icon: "error"
					});
					return; // Exit the function
				}
				//spacing checks
				if (isNaN(spacing) || spacing < 0.1 || spacing > 50) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Spacing",
						text: "Please enter an spacing between 0.1 and 50 meters.",
						icon: "error"
					});
					return; // Exit the function
				}
				//rows checksq
				if (isNaN(rows) || rows < 1 || rows > 500) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Rows",
						text: "Please enter an rows between 1 and 500.",
						icon: "error"
					});
					return; // Exit the function
				}
				//holesPerRow checks
				if (isNaN(holesPerRow) || holesPerRow < 1 || holesPerRow > 500) {
					// Show an alert to the user
					Swal.fire({
						title: "Invalid Holes Per Row",
						text: "Please enter an holes per row between 1 and 500.",
						icon: "error"
					});
					return; // Exit the function
				}

				lastValues = {
					blastName: entityName,
					offset: offset,
					nameTypeIsNumerical: nameTypeIsNumerical,
					rowOrientation: rowOrientation,
					x: x,
					y: y,
					z: z,
					diameter: diameter,
					type: type,
					angle: angle,
					bearing: bearing,
					length: length,
					burden: burden,
					spacing: spacing,
					rows: rows,
					holesPerRow: holesPerRow
				};
				localStorage.setItem("savedAddPatternPopupSettings", JSON.stringify(lastValues));

				// Use the obtained values to add the pattern
				addPattern(offset, entityName, nameTypeIsNumerical, rowOrientation, x, y, z, diameter, type, angle, bearing, length, burden, spacing, rows, holesPerRow);
			} else {
				// Handle cancel action if needed
			}
		})
		.finally(() => {
			// Hide the loading spinner when the popup is closed
			Swal.hideLoading();
		});
}

function addPattern(offset, entityName, nameTypeIsNumerical, rowOrientation, x, y, z, diameter, type, angle, bearing, length, burden, spacing, rows, holesPerRow) {
	let entityType = "hole";
	let startXLocation = parseFloat(x);
	let startYLocation = parseFloat(y);
	let startZLocation = parseFloat(z);
	let holeLength = parseFloat(length);
	let holeDiameter = parseFloat(diameter);
	let holeType = type;
	let holeAngle = parseFloat(angle);
	let holeBearing = parseFloat(bearing);
	let patternburden = parseFloat(burden);
	let patternspacing = parseFloat(spacing);
	let patternrows = parseInt(rows);
	let patternholesPerRow = parseInt(holesPerRow);
	let patternoffset = parseFloat(offset);
	let patternnameTypeIsNumerical = nameTypeIsNumerical;
	let patternrowOrientation = parseFloat((90 - rowOrientation) * (Math.PI / 180));

	let currentLetter = "A"; // Initialize the current letter
	let currentRow = 1; // Initialize the current row number

	for (let i = 0; i < patternrows; i++) {
		for (let j = 0; j < patternholesPerRow; j++) {
			// Translate to the origin
			const translatedX = startXLocation - x;
			const translatedY = startYLocation - y;

			// Calculate the rotated position based on rowOrientation
			const rotatedX = translatedX * Math.cos(patternrowOrientation) - translatedY * Math.sin(patternrowOrientation);
			const rotatedY = translatedX * Math.sin(patternrowOrientation) + translatedY * Math.cos(patternrowOrientation);

			// Translate back to the original position
			const finalX = rotatedX + x;
			const finalY = rotatedY + y;

			let holeID;
			// Initialize points as an empty array if it's null
			if (points === null) {
				points = [];
			}

			if (patternnameTypeIsNumerical) {
				holeID = currentLetter + currentRow; // Generate the hole ID
				addHole(true, entityName, points.length + 1, parseFloat(finalX), parseFloat(finalY), parseFloat(startZLocation), parseFloat(holeDiameter), holeType, parseFloat(holeLength), parseFloat(holeAngle), parseFloat(holeBearing), holeID);
			} else {
				holeID = currentLetter + (j + 1); // Generate the hole ID
				addHole(true, entityName, holeID, parseFloat(finalX), parseFloat(finalY), parseFloat(startZLocation), parseFloat(holeDiameter), holeType, parseFloat(holeLength), parseFloat(holeAngle), parseFloat(holeBearing));
			}
			startXLocation = startXLocation + patternspacing;
		}

		// Apply the offset conditionally for every second row
		if (i % 2 === 0) {
			startXLocation = x + patternoffset * patternspacing;
		} else {
			startXLocation = x;
		}

		startYLocation = startYLocation + patternburden;

		// Increment the current letter and row number
		if (currentLetter === "Z") {
			currentLetter = "AA"; // Move to double letters
		} else if (currentLetter === "ZZ") {
			currentLetter = "AAA"; // Move to triple letters if needed
		} else {
			currentLetter = incrementLetter(currentLetter); // Increment the current letter
		}

		currentRow++;
	}
	// Reset the pattern adding state
	isAddingPattern = false;
	//make the switch off
	addPatternSwitch.checked = false;
	//updateCentroids();
	resetZoom();
}

function incrementLetter(str) {
	// Helper function to increment letters
	const lastIndex = str.length - 1;
	let carry = false;
	const newStr = str
		.split("")
		.reverse()
		.map((char, index) => {
			if (index === 0 || carry) {
				if (char === "Z") {
					carry = true;
					return "A";
				} else {
					carry = false;
					return String.fromCharCode(char.charCodeAt(0) + 1);
				}
			} else {
				return char;
			}
		})
		.reverse()
		.join("");
	if (carry) {
		return "A" + newStr;
	}
	return newStr;
}

async function editBlastNamePopupAsync() {
	if (selectedHole) {
		const index = points.findIndex((point) => point === selectedHole);
		if (index !== -1) {
			clickedHole = points[index];
			blastNameValue = clickedHole.entityName;
			console.log("Async - clickedHole - " + "Blast Name : " + blastNameValue);
		}
	}
	const result = await Swal.fire({
		title: "Edit Blast Name",
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
        <div class="button-container-2col">
            <label class="labelWhite18" for="blastName">Blast Name</label>
            <input type="text" id="blastName" value="${blastNameValue}" placeholder="Blast Name" inputmode="text" autofocus />
        </div>
        `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	});

	if (result.isConfirmed) {
		const blastNameInput = document.getElementById("blastName");
		blastNameValue = blastNameInput.value.trim(); // Trim to remove leading/trailing spaces
		if (!blastNameValue) {
			Swal.fire({
				title: "Invalid Blast Name",
				text: "Blast Name is required and cannot be empty or contain only spaces.",
				icon: "error",
				confirmButtonText: "Error",
				customClass: {
					container: "custom-popup-container",
					title: "swal2-title",
					confirmButton: "confirm",
					content: "swal2-content",
					htmlContainer: "swal2-html-container",
					icon: "swal2-icon"
				}
			});
			return editBlastNamePopupAsync(); // Open the popup again
		}
	} else if (result.isDismissed) {
		return null;
	}
	console.log("Async popup - Blast Name : " + blastNameValue);
	return blastNameValue;
}

function editHoleLengthPopup() {
	Swal.fire({
		title: `Edit the length of hole. Hole: ${selectedHole.holeID} ?`,
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
		<div class="button-container-2col">
            <label class="labelWhite18" for="length">Length</label>
            <input type="number" id="length" placeholder="Length" value="0" inputmode="decimal" pattern="[0-9]*"/>
        </div>
	  `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const lengthInput = document.getElementById("length");
			const lengthValue = parseFloat(lengthInput.value);
			if (isNaN(lengthValue) || lengthValue < 0 || lengthValue > 100) {
				// Show an alert to the user
				Swal.fire({
					title: "Invalid length",
					text: "Please enter an length between 0 and 100 meters.",
					icon: "error"
				});
				return; // Exit the function
			} else if (selectedHole) {
				// Use the obtained values to add the hole
				const index = points.findIndex((point) => point === selectedHole);
				if (index !== -1) {
					clickedHole = points[index];
					//console.log("clickedHole - " + "Hole Length : " + newHoleLength + "m");
					holeLengthLabel.textContent = "Hole Length : " + parseFloat(lengthValue).toFixed(1) + "m";

					// Calculate endXYZ and draw points
					calculateEndXYZ(clickedHole, lengthValue, 1);
					drawData(points, selectedHole);
				}
			}
		}
	});
}

function setMeasuredDate() {
	const date = new Date();
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// measure tool for Length
function measuredLengthPopup() {
	Swal.fire({
		title: `Record the measured length of hole. Hole: ${selectedHole.holeID} ?`,
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
		<div class="button-container-2col">
            <label class="labelWhite18" for="length">Length</label>
            <input type="number" id="length" placeholder="Length" value="0" inputmode="decimal" pattern="[0-9]*"/>
        </div>
	  `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const lengthInput = document.getElementById("length");
			const lengthValue = parseFloat(lengthInput.value);
			if (selectedHole) {
				console.log("selectedHole: " + selectedHole.holeID + " | Hole Length : " + lengthValue + "m");
				const index = points.findIndex((point) => point === selectedHole);
				if (index !== -1) {
					clickedHole = points[index];
					//set the pointstype to the new value
					clickedHole.measuredLength = parseFloat(lengthValue);
					clickedHole.measuredLengthTimeStamp = setMeasuredDate();

					console.log("The Hole " + clickedHole.holeID + " Length is : " + clickedHole.measuredLength + " @ " + clickedHole.measuredLengthTimeStamp);

					drawData(points, selectedHole);
				}
			}
		}
	});
}
// measure tool for Mass
function measuredMassPopup() {
	Swal.fire({
		title: `Record the measured mass of hole (kg/lb) Hole: ${selectedHole.holeID} ?`,
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
		<div class="button-container-2col">
            <label class="labelWhite18" for="mass">Mass</label>
            <input type="number" id="mass" placeholder="Mass" value="0" inputmode="decimal" pattern="[0-9]*"/>
        </div>
	  `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const massInput = document.getElementById("mass");
			const massValue = massInput.value;
			if (selectedHole) {
				// Use the obtained values to add the hole
				const index = points.findIndex((point) => point === selectedHole);
				if (index !== -1) {
					clickedHole = points[index];
					//set the pointstype to the new value
					clickedHole.measuredMass = massValue;
					clickedHole.measuredMassTimeStamp = setMeasuredDate();

					console.log("The Hole " + clickedHole.holeID + " Mass is : " + clickedHole.measuredMass + " @ " + clickedHole.measuredMassTimeStamp);

					drawData(points, selectedHole);
				}
			}
		}
	});
}
// measure tool for Mass
function measuredCommentPopup() {
	if (selectedHole) {
		// Use the obtained values to add the hole
		const index = points.findIndex((point) => point === selectedHole);
		if (index !== -1) {
			clickedHole = points[index];
		}
	}

	let lastValue = clickedHole.measuredComment;

	Swal.fire({
		title: `Record a comment on the hole "${selectedHole.holeID}" ?`,
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
			<div class="button-container-2col">
				<label class="labelWhite18" for="type">Record Comment</label>
				<input type="text3" id="comment" placeholder="Comment" value="${lastValue}" inputmode="text" autofocus/>
			</div>
		  `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const commentInput = document.getElementById("comment");
			const commentValue = commentInput.value;
			if (selectedHole) {
				// Use the obtained values to add the hole
				const index = points.findIndex((point) => point === selectedHole);
				if (index !== -1) {
					clickedHole = points[index];
					//set the pointstype to the new value
					clickedHole.measuredComment = commentValue;
					clickedHole.measuredCommentTimeStamp = setMeasuredDate();

					console.log("The Hole " + clickedHole.holeID + " Comment is : " + clickedHole.measuredComment + " @ " + clickedHole.measuredCommentTimeStamp);

					drawData(points, selectedHole);
				}
			}
		}
	});
}
function handleBlastNameClick(event) {
	if (isBlastNameEditing) {
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;
		const clickedHole = getClickedHole(clickX, clickY);

		if (clickedHole && editBlastNameSwitch.checked == false) {
			if (!fromHoleStore) {
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			} else {
				drawData(points, selectedHole);
			}
		}
		if (clickedHole && editBlastNameSwitch.checked == true) {
			editBlastNamePopup(selectedHole);
		}
	}

	clickedHole = null;
	fromHoleStore = null;
	selectedHole = null;
	isBlastNameEditing = false;
	editBlastNameSwitch.checked = false;
	drawData(points, selectedHole);
}
function editBlastNamePopup(selectedHole) {
	if (selectedHole) {
		const index = points.findIndex((point) => point === selectedHole);
		if (index !== -1) {
			clickedHole = points[index];
			blastNameValue = clickedHole.entityName;
		}
	}
	let allHoleBlastNamesValue = true;
	Swal.fire({
		title: "Edit Blast Name",
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
        <div class="button-container-2col">
            <label class="labelWhite18" for="blastName">Blast Name</label>
            <input type="text" id="blastName" placeholder="Blast Name" value="${blastNameValue}" inputmode="text" autofocus />
			<label class="labelWhite18" for="allHoleBlastNames">Apply to all holes with the same name</label>
			<input type="checkbox" id="allHoleBlastNames" name="allHoleBlastNames" checked>
        </div>
        `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const blastNameInput = document.getElementById("blastName");
			blastNameValue = blastNameInput.value.trim();
			const allHoleBlastNames = document.getElementById("allHoleBlastNames").checked;
			allHoleBlastNamesValue = allHoleBlastNames;
			const index = points.findIndex((point) => point === selectedHole);
			if (index !== -1) {
				drawData(points, selectedHole);
				// Get the current entity name before any changes
				let currentEntityName = points[index].entityName;

				if (allHoleBlastNamesValue === false) {
					// Update only the selected hole
					console.log("Before:point.fromHoleID : " + points[index].fromHoleID);
					points[index].entityName = blastNameValue;
					points[index].fromHoleID = blastNameValue + ":::" + points[index].holeID; //connects to its self for now but will need to recornnect existing connections in future
					console.log("After:point.fromHoleID : " + points[index].fromHoleID);
				}
				if (allHoleBlastNamesValue === true) {
					// Update all holes with the same current entity name
					points.forEach((point) => {
						if (point.entityName === currentEntityName) {
							console.log("Before:point.fromHoleID : " + point.fromHoleID);
							point.entityName = blastNameValue;
							const [entity, id] = point.fromHoleID.split(":::");
							point.fromHoleID = entity + ":::" + id;
							console.log("After:point.fromHoleID : " + point.fromHoleID);
						}
					});
				}
			}
			///////FOR DEBUGGING ONLY/////////////////////
			const pointsMap = new Map();
			for (const point of points) {
				if (!pointsMap.has(point.entityName)) {
					pointsMap.set(point.entityName, {
						entityName: point.entityName,
						data: []
					});
				}
				pointsMap.get(point.entityName).data.push(point);
			}
			for (const entity of pointsMap.values()) {
				console.log(entity);
			}
			//////////////////////////////////////////////
			drawData(points, selectedHole);
		}
	});
}
// Using SweetAlert Library Create a popup that gets input from the user.
function editHoleTypePopup() {
	if (selectedHole) {
		// Use the obtained values to add the hole
		const index = points.findIndex((point) => point === selectedHole);
		if (index !== -1) {
			clickedHole = points[index];
		}
	}

	let lastValue = clickedHole.holeType;

	Swal.fire({
		title: `Edit the Type of hole "${selectedHole.holeID}" ?`,
		showCancelButton: true,
		confirmButtonText: "Confirm",
		cancelButtonText: "Cancel",
		html: `
		<div class="button-container-2col">
            <label class="labelWhite18" for="type">Type of Hole</label>
            <input type="text3" id="type" placeholder="Type" value="${lastValue}" inputmode="text" autofocus/>
        </div>
	  `,
		customClass: {
			container: "custom-popup-container",
			title: "swal2-title",
			confirmButton: "confirm",
			cancelButton: "cancel",
			content: "swal2-content",
			htmlContainer: "swal2-html-container",
			icon: "swal2-icon"
		}
	}).then((result) => {
		if (result.isConfirmed) {
			const typeInput = document.getElementById("type");
			const typeValue = typeInput.value;
			if (selectedHole) {
				// Use the obtained values to add the hole
				const index = points.findIndex((point) => point === selectedHole);
				if (index !== -1) {
					clickedHole = points[index];
					//set the pointstype to the new value
					clickedHole.holeType = typeValue;

					drawData(points, selectedHole);
				}
			}
		}
	});
}

//Add hole to the points array popup using sweetalert and then draw the points
//Add hole to the points array popup using sweetalert and then draw the points
function addHole(useCustomHoleID, entityName, holeID, startXLocation, startYLocation, startZLocation, diameter, type, length, angle, bearing) {
	if (typeof entityName === "string" && entityName.trim() !== "") {
		entityName = entityName.trim();
	} else {
		entityName = "undefined";
	}
	const entityType = "hole";

	// Initialize points as an empty array if it's null
	if (points === null) {
		points = [];
	}

	let newHoleID = null;
	if (useCustomHoleID === true) {
		newHoleID = holeID;
	} else if (useCustomHoleID === false) {
		if (points !== null) {
			newHoleID = points.length + 1;
		} else {
			newHoleID = 1;
		}
	} else {
		newHoleID = 9999;
	}
	startXLocation = parseFloat(startXLocation);
	startYLocation = parseFloat(startYLocation);
	startZLocation = parseFloat(startZLocation);
	let endXLocation = parseFloat(startXLocation + length * Math.cos((90 - angle) * (Math.PI / 180)) * Math.cos(((450 - bearing) % 360) * (Math.PI / 180)));
	let endYLocation = parseFloat(startYLocation + length * Math.cos((90 - angle) * (Math.PI / 180)) * Math.sin(((450 - bearing) % 360) * (Math.PI / 180)));
	let endZLocation = parseFloat(startZLocation - length * Math.cos(angle * (Math.PI / 180)));
	// Check if endXLocation, endYLocation, or endZLocation is NaN
	if (isNaN(endXLocation)) {
		endXLocation = startXLocation;
	}

	if (isNaN(endYLocation)) {
		endYLocation = startYLocation;
	}

	if (isNaN(endZLocation)) {
		endZLocation = startZLocation;
	}
	let holeDiameter = parseFloat(diameter);
	let holeType = type;
	let holeLengthCalculated = parseFloat(length);
	let holeAngle = parseFloat(angle);
	let holeBearing = parseFloat(bearing);
	if (isNaN(holeLengthCalculated)) {
		holeLengthCalculated = 0;
	}
	if (isNaN(holeAngle)) {
		holeAngle = 0;
	}
	if (isNaN(holeBearing)) {
		holeBearing = 0;
	}
	let toHoleCombinedID = entityName.toString() + ":::" + newHoleID.toString();
	let timingDelayMilliseconds = 0;
	let colourHexDecimal = "red";
	let measuredLength = 0;
	let measuredLengthTimeStamp = "09/05/1975 00:00:00";
	let measuredMass = 0;
	let measuredMassTimeStamp = "09/05/1975 00:00:00";
	let measuredComment = "None";
	let measuredCommentTimeStamp = "09/05/1975 00:00:00";

	points.push({
		entityName: entityName,
		entityType: entityType,
		holeID: newHoleID.toString(),
		startXLocation: startXLocation,
		startYLocation: startYLocation,
		startZLocation: startZLocation,
		endXLocation: endXLocation,
		endYLocation: endYLocation,
		endZLocation: endZLocation,
		holeDiameter: holeDiameter,
		holeType: holeType,
		holeLengthCalculated: holeLengthCalculated,
		holeAngle: holeAngle,
		holeBearing: holeBearing,
		fromHoleID: toHoleCombinedID.toString(),
		timingDelayMilliseconds: timingDelayMilliseconds,
		colourHexDecimal: colourHexDecimal.toString(),
		measuredLength: measuredLength,
		measuredLengthTimeStamp: measuredLengthTimeStamp,
		measuredMass: measuredMass,
		measuredMassTimeStamp: measuredMassTimeStamp,
		measuredComment: measuredComment,
		measuredCommentTimeStamp: measuredCommentTimeStamp
	});
	console.log("Added Hole: " + newHoleID);
	console.log(
		"Added Hole attributes: \nentiyName: " +
			entityName +
			"\nHoleID: " +
			newHoleID +
			"\nStartX: " +
			startXLocation +
			" StartY: " +
			startYLocation +
			" StartZ: " +
			startZLocation +
			"\nEndX: " +
			endXLocation +
			" EndY: " +
			endYLocation +
			" EndZ: " +
			endZLocation +
			"\nDiameter: " +
			holeDiameter +
			" Type: " +
			holeType +
			"\nLength: " +
			holeLengthCalculated +
			" Angle: " +
			holeAngle +
			" Bearing: " +
			holeBearing +
			"\nFromHoleID: " +
			toHoleCombinedID +
			" TimingDelay: " +
			timingDelayMilliseconds +
			" Colour: " +
			colourHexDecimal +
			"\nMeasuredLength: " +
			measuredLength +
			" MeasuredLengthTimeStamp: " +
			measuredLengthTimeStamp +
			"\nMeasuredMass: " +
			measuredMass +
			" MeasuredMassTimeStamp: " +
			measuredMassTimeStamp +
			"\nMeasuredComment: " +
			measuredComment +
			" MeasuredCommentTimeStamp: " +
			measuredCommentTimeStamp
	);
	if (isAddingHole && !isAddingPattern) {
		drawData(points, selectedHole);
	}
}

function debugPoints(points) {
	///////FOR DEBUGGING ONLY/////////////////////
	const pointsMap = new Map();
	for (const point of points) {
		if (!pointsMap.has(point.entityName)) {
			pointsMap.set(point.entityName, {
				entityName: point.entityName,
				data: []
			});
		}
		pointsMap.get(point.entityName).data.push(point);
	}
	for (const entity of pointsMap.values()) {
		console.log(entity);
	}
	//////////////////////////////////////////////
}

function handleMeasuredLengthClick(event) {
	if (isMeasureRecording) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;
		//const measuredLengthTimeStamp = formatDate(new Date().toLocaleString());

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);
		console.log("ClickedX = " + clickX);
		console.log("ClickedY = " + clickY);
		console.log("ClickedHole = " + clickedHole.holeID);
		if (clickedHole && measuredLengthSwitch.checked == false) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			}
		} else if (clickedHole && measuredLengthSwitch.checked == true) {
			measuredLengthPopup();
		}
	}
}
function handleMeasuredMassClick(event) {
	if (isMeasureRecording) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;
		//const measuredMassTimeStamp = formatDate(new Date().toLocaleString());

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);
		console.log("ClickedX = " + clickX);
		console.log("ClickedY = " + clickY);
		console.log("ClickedHole = " + clickedHole);
		if (clickedHole && measuredMassSwitch.checked == false) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			}
		} else if (clickedHole && measuredMassSwitch.checked == true) {
			measuredMassPopup();
		}
	}
}
function handleMeasuredCommentClick(event) {
	if (isMeasureRecording) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;
		//const measuredCommentTimeStamp = formatDate(new Date().toLocaleString());

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);
		console.log("ClickedX = " + clickX);
		console.log("ClickedY = " + clickY);
		console.log("ClickedHole = " + clickedHole);
		if (clickedHole && measuredCommentSwitch.checked == false) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			}
		} else if (clickedHole && measuredCommentSwitch.checked == true) {
			measuredCommentPopup();
		}
	}
}

function handleHoleTypeEditClick(event) {
	if (isTypeEditing) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);
		console.log("ClickedX = " + clickX);
		console.log("ClickedY = " + clickY);
		console.log("ClickedHole = " + clickedHole);
		if (clickedHole && editHoleTypePopupSwitch.checked == false) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			}
		} else if (clickedHole && editHoleTypePopupSwitch.checked == true) {
			editHoleTypePopup();
		}
	}
}

function handleHoleLengthEditClick(event) {
	if (isLengthEditing) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);
		drawData(points, selectedHole);

		if (clickedHole && editLengthPopupSwitch.checked == false) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			} else {
				drawData(points, selectedHole);
				//console.log("centroidX: " + centroidX + " centroidY: " + centroidY);
			}
		} else if (clickedHole && editLengthPopupSwitch.checked == true) {
			editHoleLengthPopup();
		}
		const multipleClickedHoles = getMultipleClickedHoles(clickX, clickY);
		if (multipleClickedHoles.length > 0 && selectionMode && editLengthPopupSwitch.checked == false) {
			selectedMultipleHoles = [...multipleClickedHoles]; // Update the selection
			drawData(points, selectedHole); // You might need to modify this function to handle multiple selected holes
		}
	}
}

function handleHoleDiameterEditClick(event) {
	if (isDiameterEditing) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);

		if (clickedHole) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			} else {
				drawData(points, selectedHole);
				//console.log("centroidX: " + centroidX + " centroidY: " + centroidY);
			}
		}
		const multipleClickedHoles = getMultipleClickedHoles(clickX, clickY);
		if (multipleClickedHoles.length > 0 && selectionMode) {
			selectedMultipleHoles = [...multipleClickedHoles]; // Update the selection
			drawData(points, selectedHole); // You might need to modify this function to handle multiple selected holes
		}
	}
}

function handleAngleEditClick(event) {
	if (isAngleEditing) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;
		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);

		if (clickedHole && !selectionMode) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			} else {
				drawData(points, selectedHole);
				//console.log("centroidX: " + centroidX + " centroidY: " + centroidY);
			}
		}
		// Get the clicked hole or holes
		const multipleClickedHoles = getMultipleClickedHoles(clickX, clickY);
		//console.log("Multiple Clicked Holes List: ");
		//multipleClickedHoles.forEach(hole => console.log("-  Entity: ", hole.entityName, " Hole:", hole.holeID));

		// If holes are selected, add them to the selection and redraw the canvas
		if (multipleClickedHoles.length > 0 && selectionMode) {
			selectedMultipleHoles = [...multipleClickedHoles]; // Update the selection
			drawData(points, selectedHole); // You might need to modify this function to handle multiple selected holes
		}
	}
}

function handleBearingEditClick(event) {
	if (isBearingEditing) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);

		if (clickedHole) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			} else {
				drawData(points, selectedHole);
				//console.log("centroidX: " + centroidX + " centroidY: " + centroidY);
			}
		}
		const multipleClickedHoles = getMultipleClickedHoles(clickX, clickY);

		if (multipleClickedHoles.length > 0 && selectionMode) {
			selectedMultipleHoles = [...multipleClickedHoles]; // Update the selection
			drawData(points, selectedHole); // You might need to modify this function to handle multiple selected holes
		}
	}
}

function handleEastingEditClick(event) {
	if (isEastingEditing) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);

		if (clickedHole) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			} else {
				drawData(points, selectedHole);
				//console.log("centroidX: " + centroidX + " centroidY: " + centroidY);
			}
		}
		const multipleClickedHoles = getMultipleClickedHoles(clickX, clickY);

		if (multipleClickedHoles.length > 0 && selectionMode) {
			selectedMultipleHoles = [...multipleClickedHoles]; // Update the selection
			drawData(points, selectedHole); // You might need to modify this function to handle multiple selected holes
		}
	}
}

function handleNorthingEditClick(event) {
	if (isNorthingEditing) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);

		if (clickedHole) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			} else {
				drawData(points, selectedHole);
				//console.log("centroidX: " + centroidX + " centroidY: " + centroidY);
			}
		}
		const multipleClickedHoles = getMultipleClickedHoles(clickX, clickY);
		if (multipleClickedHoles.length > 0 && selectionMode) {
			selectedMultipleHoles = [...multipleClickedHoles]; // Update the selection
			drawData(points, selectedHole); // You might need to modify this function to handle multiple selected holes
		}
	}
}

function handleElevationEditClick(event) {
	if (isElevationEditing) {
		// Get the click/touch coordinates relative to the canvas
		const rect = canvas.getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const clickY = event.clientY - rect.top;

		// Get the clicked hole
		const clickedHole = getClickedHole(clickX, clickY);

		if (clickedHole) {
			if (!fromHoleStore) {
				// Set the selected fromHole
				fromHoleStore = clickedHole;
				selectedHole = clickedHole;
				drawData(points, selectedHole);
			} else {
				drawData(points, selectedHole);
				//console.log("centroidX: " + centroidX + " centroidY: " + centroidY);
			}
		}
		const multipleClickedHoles = getMultipleClickedHoles(clickX, clickY);
		if (multipleClickedHoles.length > 0 && selectionMode) {
			selectedMultipleHoles = [...multipleClickedHoles]; // Update the selection
			drawData(points, selectedHole); // You might need to modify this function to handle multiple selected holes
		}
	}
}

// function recalculateContours(points, deltaX, deltaY) {
// 	try {
// 		const contourData = [];
// 		holeTimes = calculateTimes(points);
// 		timeChart();

// 		// Prepare contour data
// 		for (let i = 0; i < holeTimes.length; i++) {
// 			const [entityName, holeID] = holeTimes[i][0].split(":::");
// 			const time = holeTimes[i][1];

// 			const point = points.find(p => p.entityName === entityName && p.holeID === holeID);

// 			if (point) {
// 				contourData.push({
// 					x: point.startXLocation,
// 					y: point.startYLocation,
// 					z: time
// 				});
// 			}
// 		}

// 		if (contourData.length === 0) {
// 			throw new Error("No valid contour data points found.");
// 		}

// 		const maxHoleTime = Math.max(...contourData.map(point => point.z));

// 		// Initialize directionArrows array to store the arrows
// 		directionArrows = [];

// 		// Calculate contour lines and store them in contourLinesArray
// 		contourLinesArray = [];
// 		let interval = maxHoleTime < 350 ? 25 : maxHoleTime < 700 ? 100 : 250;
// 		interval = parseInt(intervalAmount);

// 		// Variable to store the previous contour line and the first contour line
// 		let previousContourLine = null;
// 		let firstContourLine = null;

// 		// Iterate over contour levels
// 		for (let contourLevel = 0; contourLevel <= maxHoleTime; contourLevel += interval) {
// 			const contourLines = delaunayContours(contourData, contourLevel, maxEdgeLength);
// 			const epsilon = 1; // Adjust this value to control the level of simplification
// 			const simplifiedContourLines = contourLines.map(line => simplifyLine(line, epsilon));
// 			contourLinesArray.push(simplifiedContourLines);

// 			// Handle the first contour line using Method 1
// 			if (!firstContourLine) {
// 				firstContourLine = simplifiedContourLines[0]; // Store the first contour line

// 				for (const contourLine of simplifiedContourLines) {
// 					for (let i = 0; i < contourLine.length - 1; i++) {
// 						const p1 = contourLine[i];
// 						const p2 = contourLine[i + 1];

// 						// Calculate distance between points
// 						//const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

// 						// Skip if p1 and p2 are too close (tiny segment)
// 						const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
// 						if (distance < 0.01) continue;

// 						// Place arrows every 2 meters along the contour line
// 						if (distance >= 2) {
// 							const numArrows = Math.floor(distance / 2);

// 							for (let j = 0; j < numArrows; j++) {
// 								const t = (j + 0.5) / numArrows; // Position along the contour line

// 								const arrowStartX = p1.x + t * (p2.x - p1.x);
// 								const arrowStartY = p1.y + t * (p2.y - p1.y);

// 								// Calculate perpendicular direction for the arrow
// 								let perpX = -(p1.y - p2.y);
// 								let perpY = p1.x - p2.x;

// 								// Normalize the perpendicular vector
// 								const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
// 								perpX /= perpLength;
// 								perpY /= perpLength;

// 								// Calculate end point of the arrow, proportional shift (25ms)
// 								const arrowEndX = arrowStartX + perpX * (interval / (interval / 3));
// 								const arrowEndY = arrowStartY + perpY * (interval / (interval / 3));

// 								// Store the arrow parameters in the directionArrows array
// 								directionArrows.push([arrowStartX, arrowStartY, arrowEndX, arrowEndY, "goldenrod", firstMovementSize]);
// 							}
// 						}
// 					}
// 				}
// 			} else {
// 				// Handle subsequent contour lines using Method 2 (nearest point on previous contour line)
// 				for (const contourLine of simplifiedContourLines) {
// 					for (let i = 0; i < contourLine.length - 1; i++) {
// 						const p1 = contourLine[i];
// 						const p2 = contourLine[i + 1];

// 						// Calculate the distance between points on the current contour line
// 						//const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

// 						// Skip if p1 and p2 are too close (tiny segment)
// 						const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
// 						if (distance < 0.01) continue;

// 						// Place arrows every 2 meters along the contour line
// 						if (distance >= 2) {
// 							const numArrows = Math.floor(distance / 2);

// 							for (let j = 0; j < numArrows; j++) {
// 								const t = (j + 0.5) / numArrows; // Position along the contour line

// 								const arrowStartX = p1.x + t * (p2.x - p1.x);
// 								const arrowStartY = p1.y + t * (p2.y - p1.y);

// 								// Find the nearest point on the previous contour line
// 								let nearestPoint = previousContourLine.reduce(
// 									(nearest, current) => {
// 										const dist = Math.sqrt(Math.pow(current.x - arrowStartX, 2) + Math.pow(current.y - arrowStartY, 2));
// 										return dist < nearest.dist ? { point: current, dist: dist } : nearest;
// 									},
// 									{ point: null, dist: Infinity }
// 								).point;

// 								// Handle the case where nearestPoint is null
// 								if (!nearestPoint) continue;

// 								// Calculate the vector from the current contour line to the previous one
// 								const dirX = nearestPoint.x - arrowStartX;
// 								const dirY = nearestPoint.y - arrowStartY;

// 								// Calculate the perpendicular vector to the current contour line (p1, p2)
// 								let perpX = -(p2.y - p1.y);
// 								let perpY = p2.x - p1.x;

// 								// Normalize the perpendicular vector
// 								const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
// 								perpX /= perpLength;
// 								perpY /= perpLength;

// 								// Adjust the perpendicular vector to point in the direction of the previous contour line
// 								const dotProduct = dirX * perpX + dirY * perpY;
// 								if (dotProduct < 0) {
// 									// Flip direction if pointing the wrong way
// 									perpX = -perpX;
// 									perpY = -perpY;
// 								}

// 								// Calculate end point of the arrow, proportional shift (25ms)
// 								const arrowEndX = arrowStartX + perpX * (interval / (interval / 3));
// 								const arrowEndY = arrowStartY + perpY * (interval / (interval / 3));

// 								// Store the arrow parameters in the directionArrows array
// 								directionArrows.push([arrowStartX, arrowStartY, arrowEndX, arrowEndY, "goldenrod", firstMovementSize]);
// 							}
// 						}
// 					}
// 				}
// 			}

// 			// Update previousContourLine for the next iteration, and ensure it's flattened if nested
// 			previousContourLine = simplifiedContourLines.flat().filter(Boolean); // Avoid null points in contour lines
// 		}

// 		// Return both contour lines and direction arrows
// 		return { contourLinesArray, directionArrows };
// 	} catch (err) {
// 		console.error(err);
// 	}
// }

function recalculateContours(points, deltaX, deltaY) {
	try {
		const contourData = [];
		holeTimes = calculateTimes(points);
		timeChart();

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
		contourLinesArray = [];
		directionArrows = [];
		let interval = maxHoleTime < 350 ? 25 : maxHoleTime < 700 ? 100 : 250;
		interval = parseInt(intervalAmount);

		// Iterate over contour levels
		for (let contourLevel = 0; contourLevel <= maxHoleTime; contourLevel += interval) {
			const { contourLines, directionArrows } = delaunayContours(contourData, contourLevel, maxEdgeLength);
			const epsilon = 1; // Adjust this value to control the level of simplification
			const simplifiedContourLines = contourLines.map((line) => simplifyLine(line, epsilon));
			contourLinesArray.push(simplifiedContourLines);

			//console.log("contourLinesArray: ", contourLinesArray);
			//console.log("directionArrows: ", directionArrows);
		}
		// Return both contour lines
		return { contourLinesArray, directionArrows };
	} catch (err) {
		console.error(err);
	}
}

function calculateEndXYZ(clickedHole, newValue, modeLAB) {
	let startX = clickedHole.startXLocation;
	let startY = clickedHole.startYLocation;
	let startZ = clickedHole.startZLocation;
	let holeLength = clickedHole.holeLengthCalculated;
	let holeAngle = clickedHole.holeAngle;
	let holeBearing = clickedHole.holeBearing;
	let endX, endY, endZ;
	// Include entityName in the search to get the index of the clicked hole within the points array
	const index = points.findIndex((point) => point.holeID === clickedHole.holeID && point.entityName === clickedHole.entityName);

	if (modeLAB === 1) {
		//Length
		endX = startX + newValue * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.cos(((450 - holeBearing) % 360) * (Math.PI / 180));
		endY = startY + newValue * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.sin(((450 - holeBearing) % 360) * (Math.PI / 180));
		endZ = startZ - newValue * Math.cos(holeAngle * (Math.PI / 180));
		// Update the points array with the new values
		if (index !== -1) {
			points[index].endXLocation = endX;
			points[index].endYLocation = endY;
			points[index].endZLocation = endZ;
			points[index].holeLengthCalculated = parseFloat(newValue);
			//console.log("points[index].holeLengthCalculated: " + points[index].holeLengthCalculated);
			//console.log("End X,Y,Z : " + endX + " | " + endY + " | " + endZ);
		}
	} else if (modeLAB === 2) {
		//hole angle
		//calculate the endXYZ based on the new hole angle
		endX = startX + holeLength * Math.cos((90 - newValue) * (Math.PI / 180)) * Math.cos(((450 - holeBearing) % 360) * (Math.PI / 180));
		endY = startY + holeLength * Math.cos((90 - newValue) * (Math.PI / 180)) * Math.sin(((450 - holeBearing) % 360) * (Math.PI / 180));
		endZ = startZ - holeLength * Math.cos(newValue * (Math.PI / 180));
		//Update the points array with the new values
		if (index !== -1) {
			points[index].endXLocation = endX;
			points[index].endYLocation = endY;
			points[index].endZLocation = endZ;
			points[index].holeAngle = parseFloat(newValue);
		}
	} else if (modeLAB === 3) {
		//Calculate the endXYZ based on the new hole bearing
		endX = startX + holeLength * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.cos(((450 - newValue) % 360) * (Math.PI / 180));
		endY = startY + holeLength * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.sin(((450 - newValue) % 360) * (Math.PI / 180));
		endZ = startZ - holeLength * Math.cos(holeAngle * (Math.PI / 180));
		//Update the points array with the new values
		if (index !== -1) {
			points[index].endXLocation = endX;
			points[index].endYLocation = endY;
			points[index].endZLocation = endZ;
			points[index].holeBearing = parseFloat(newValue);
		}
	} else if (modeLAB === 4) {
		// Easting Adjustment
		const deltaX = newValue - clickedHole.startXLocation;
		clickedHole.startXLocation = newValue;
		clickedHole.endXLocation += deltaX;
		//calculate the new toe XYZ based on the new startXlocation
		endX = startX + holeLength * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.cos(((450 - holeBearing) % 360) * (Math.PI / 180));
		endY = startY + holeLength * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.sin(((450 - holeBearing) % 360) * (Math.PI / 180));
		endZ = startZ - holeLength * Math.cos(holeAngle * (Math.PI / 180));
		// Update the points array with the new values
		if (index !== -1) {
			points[index].endXLocation = endX;
			points[index].endYLocation = endY;
			points[index].endZLocation = endZ;
			points[index].startXLocation = clickedHole.startXLocation;
		}
	} else if (modeLAB === 5) {
		// Northing Adjustment
		const deltaY = newValue - clickedHole.startYLocation;
		clickedHole.startYLocation = newValue;
		clickedHole.endYLocation += deltaY;
		//calculate the new toe XYZ based on the new startYlocation
		endX = startX + holeLength * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.cos(((450 - holeBearing) % 360) * (Math.PI / 180));
		endY = startY + holeLength * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.sin(((450 - holeBearing) % 360) * (Math.PI / 180));
		endZ = startZ - holeLength * Math.cos(holeAngle * (Math.PI / 180));
		// Update the points array with the new values
		if (index !== -1) {
			points[index].endXLocation = endX;
			points[index].endYLocation = endY;
			points[index].endZLocation = endZ;
			points[index].startYLocation = clickedHole.startYLocation;
		}
	} else if (modeLAB === 6) {
		// Elevation Adjustment
		const deltaZ = newValue - clickedHole.startZLocation;
		clickedHole.startZLocation = newValue;
		clickedHole.endZLocation += deltaZ;
		//calculate the new toe XYZ based on the new startZlocation
		endX = startX + holeLength * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.cos(((450 - holeBearing) % 360) * (Math.PI / 180));
		endY = startY + holeLength * Math.cos((90 - holeAngle) * (Math.PI / 180)) * Math.sin(((450 - holeBearing) % 360) * (Math.PI / 180));
		endZ = startZ - holeLength * Math.cos(holeAngle * (Math.PI / 180));

		// Update the points array with the new values
		if (index !== -1) {
			points[index].endXLocation = endX;
			points[index].endYLocation = endY;
			points[index].endZLocation = endZ;
			points[index].startZLocation = clickedHole.startZLocation;
		}
	} else if (modeLAB === 7) {
		const diameter = newValue;
		// Update the points array with the new values
		if (index !== -1) {
			points[index].holeDiameter = diameter;
		}
	}

	return {
		endX,
		endY,
		endZ
	};
}

function timeChart() {
	if (Array.isArray(holeTimes)) {
		const times = holeTimes.map((time) => time[1]);
		const maxTime = Math.max(...times);
		const timeRange = parseInt(document.getElementById("timeRange").value);
		const numBins = Math.ceil(maxTime / timeRange);
		let counts = [];
		try {
			counts = Array(numBins).fill(0);
		} catch (error) {
			fileFormatPopup(error);
		}

		for (let i = 0; i < times.length; i++) {
			const binIndex = Math.floor(times[i] / timeRange);
			counts[binIndex]++;
		}

		var config = {
			responsive: true,
			displayModeBar: true,
			modeBarButtonsToRemove: ["lasso2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
			modeBarButtons: [["select2d", "zoomIn2d", "zoomOut2d", "autoScale2d", "resetScale2d", "toImage", "pan2d"]]
		};

		const binEdges = Array(numBins)
			.fill(0)
			.map((_, index) => index * timeRange);

		// Create an array to store the holeID for each bin
		const holeIDs = Array(numBins).fill(null);

		// Store the combined entityName:holeID in the corresponding bin
		for (const point of points) {
			const binIndex = Math.floor(point.holeTime / timeRange);
			holeIDs[binIndex] = holeIDs[binIndex] || []; // Initialize with an empty array if not set
			holeIDs[binIndex].push(`${point.entityName}:${point.holeID}`);
		}
		// Create an array to store the concatenated holeID strings for each bin
		const holeIDTexts = holeIDs.map((ids) => (ids ? ids.join(", ") : ""));

		// Create text for hover labels using entity name and hole ID
		const entityholeIDTexts = holeIDs.map((bin) => {
			if (bin) {
				return bin
					.map((combinedID) => {
						// Split the combinedID into entityName and holeID
						const [entityName, holeID] = combinedID.split(":");
						// Find the point associated with both entityName and holeID
						const point = points.find((p) => p.entityName === entityName && p.holeID === holeID);
						// Check if point is found to avoid undefined values
						if (point) {
							return `${point.entityName}:${point.holeID}`;
						}
						return "";
					})
					.filter((text) => text) // Filter out any empty strings
					.join(", ");
			} else {
				return "";
			}
		});

		const defaultColour = Array(numBins).fill("red");

		const data = [
			{
				x: binEdges,
				y: counts,
				type: "bar",
				marker: {
					color: defaultColour
				},
				// Use the holeIDs array as the text property for hover labels
				text: entityholeIDTexts, //holeIDTexts,
				hoverinfo: "y+text" // Show the y-value and the custom text when hovering
			}
		];
		const maxHolesPerBin = Math.max(...counts); // Calculate the maximum holes per bin
		// Add 1 to provide space at the top
		const maxYValue = maxHolesPerBin + 1;
		const layout = {
			title: {
				text: "Time Window Chart",
				xanchor: "right",
				font: {
					size: 10 // Set the title font size
				}
			},
			plot_bgcolor: noneColour,
			paper_bgcolor: noneColour,
			font: {
				color: textFillColour
			},
			modebar: {
				orientation: "v",
				bgcolor: noneColour,
				color: "rgba(255, 0, 0, 0.4)",
				activecolor: "red",
				position: "left"
			},
			margin: {
				l: 5,
				r: 50,
				b: 25,
				t: 25,
				pad: 2
			},
			xaxis: {
				title: {
					text: "milliseconds (ms)",
					font: {
						size: 10 // Set the y-axis label font size
					}
				},
				showgrid: true
			},
			yaxis: {
				title: {
					text: "Holes Firing",
					font: {
						size: 10 // Set the y-axis label font size
					}
				},
				showgrid: true,
				//set the yaxis title to the right of the chart
				automargin: true,
				//set the font size of the yaxis title
				range: [0, maxYValue - 0.5]
				// Ensure y-axis values are whole integers
			},
			height: 380,
			width: 280
		};

		Plotly.newPlot("timeChart", data, layout, config);

		// Add click event listener to the plot
		const chart = document.getElementById("timeChart");
		// Outside of your event listener, define a variable to keep track of the last clicked index
		let lastClickedIndex = null;
		// Box and Lasso Selection Listener
		chart.on("plotly_selected", function (eventData) {
			if (eventData && eventData.points) {
				const selectedPoints = eventData.points.map((p) => p.pointNumber);
				const newColours = defaultColour.map((color, index) => (selectedPoints.includes(index) ? "lime" : color));
				Plotly.restyle("timeChart", { "marker.color": [newColours] });

				timingWindowHolesSelected = selectedPoints
					.flatMap((index) => {
						return holeIDs[index]
							? holeIDs[index].map((combinedID) => {
									const [entityName, holeID] = combinedID.split(":");
									return points.find((p) => p.entityName === entityName && p.holeID === holeID);
							  })
							: [];
					})
					.filter((point) => point !== undefined);

				console.log("Selected Holes:", timingWindowHolesSelected);
				drawData(points, selectedHole);
			} else {
				Plotly.restyle("timeChart", { "marker.color": [defaultColour] });
				timingWindowHolesSelected = [];
				drawData(points, selectedHole);
			}
		});

		// Single Bar Click Event
		chart.on("plotly_click", function (data) {
			if (data.points && data.points.length > 0) {
				const clickedIndex = data.points[0].pointIndex;
				const clickedBarColor = "lime";
				const defaultBarColor = "red";
				const currentColors = data.points[0].data.marker.color.slice();
				// Reset the color of the last clicked bar, if any
				if (lastClickedIndex !== null) {
					currentColors[lastClickedIndex] = defaultBarColor;
				}

				// Update the clicked bar color
				currentColors[clickedIndex] = clickedBarColor;

				// Update the chart to reflect the new colors
				Plotly.restyle("timeChart", { "marker.color": [currentColors] });

				// Update lastClickedIndex
				lastClickedIndex = clickedIndex;

				timingWindowHolesSelected = holeIDs[clickedIndex]
					? holeIDs[clickedIndex]
							.map((combinedID) => {
								const [entityName, holeID] = combinedID.split(":");
								return points.find((p) => p.entityName === entityName && p.holeID === holeID);
							})
							.filter((point) => point !== undefined)
					: [];

				console.log("timingWindowHolesSelected:", timingWindowHolesSelected);
				drawData(points, selectedHole);
			} else {
				timingWindowHolesSelected = [];
				lastClickedIndex = null;
				drawData(points, selectedHole);
			}
		});

		// Reset Selection Event
		chart.on("plotly_deselect", function () {
			// Reset the bar colors to the default color
			Plotly.restyle("timeChart", { "marker.color": [defaultColour] });

			// Clear any selected holes
			timingWindowHolesSelected = [];
			drawData(points, selectedHole);

			// Reset the last clicked index
			lastClickedIndex = null;

			console.log("Chart reset to unselected state.");
		});
	}
}

// Function to update the play speed
function updatePlaySpeed() {
	const playSpeedInput = document.getElementById("playSpeed");

	playSpeed = parseFloat(playSpeedInput.value);
}
// Add click event listener to the "Play" button
const playButton = document.getElementById("play");
playButton.addEventListener("click", () => {
	refreshPoints();
	updatePlaySpeed(); // Update play speed
	const maxTime = Math.max(...holeTimes.map((time) => time[1])); // Get the max time
	isPlaying = true;
	// Clear previous animation interval before starting a new one
	clearInterval(animationInterval);

	let currentTime = 0;
	const animationStep = Math.max(0.1, playSpeed); // Minimum animation step of 1 millisecond

	play.textContent = "Playing at " + parseFloat(playSpeed).toFixed(3) + "x speed";
	//Set the display7 as checked
	//document.getElementById("display7").checked = true;

	// Start the animation loop
	animationInterval = setInterval(() => {
		if (currentTime <= maxTime + (playSpeed + playSpeed * 15)) {
			timingWindowHolesSelected = points.filter((point) => point.holeTime <= currentTime);
			drawData(points, timingWindowHolesSelected); // Call drawPoints with the updated selectedHolesArray
			currentTime += animationStep;
		} else {
			//call the stopbutton function
			stopButton.click();
			clearInterval(animationInterval); // Stop the animation when maxTime is reached
		}
	}, animationStep);
});

// Add click event listener to the "Stop" button
const stopButton = document.getElementById("stop");
stopButton.addEventListener("click", () => {
	clearInterval(animationInterval); // Stop the ongoing animation
	isPlaying = false;
	timingWindowHolesSelected = []; // Reset the selected holes array
	//drawData(points, timingWindowHolesSelected); // Call drawPoints to reset the highlights
});

// Add input event listener to the playSpeed input range
const playSpeedInput = document.getElementById("playSpeed");
playSpeedInput.addEventListener("input", updatePlaySpeed);

function drawLegend(strokecolour) {
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

function drawData(points, selectedHole) {
	clearCanvas();
	// Disable image smoothing (anti-aliasing)
	ctx.imageSmoothingEnabled = false;

	if (selectedPoint !== null) {
		const x = (selectedPoint.pointXLocation - centroidX) * currentScale + canvas.width / 2; // adjust x position
		const y = (-selectedPoint.pointYLocation + centroidY) * currentScale + canvas.height / 2; // adjust y position
		drawHiHole(x, y, 10, "rgba(255, 102, 255, 0.3)", "rgba(255, 0, 255, 0.6)");
	}
	/*
	// Highlight selected holes
	selectedMultipleHoles.forEach(hole => {
		console.log("Drawing Selected Multiple Holes: entity:", hole.entityName, " hole:", hole.holeID);
		const x = (hole.pointXLocation - centroidX) * currentScale + canvas.width / 2; // adjust x position
		const y = (-hole.pointYLocation + centroidY) * currentScale + canvas.height / 2; // adjust y position
		drawHiHole(x, y, 10, "rgba(255, 102, 255, 0.3)", "rgba(255, 0, 255, 0.6)");
	});*/

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
		//console.log("Drawing Direction Arrows");
		//console.log("First Movement:", directionArrows);
		connScale = document.getElementById("connSlider").value;
		for (let i = 0; i < directionArrows.length; i++) {
			const arrow = directionArrows[i];
			const startX = (arrow[0] - centroidX) * currentScale + canvas.width / 2;
			const startY = (-arrow[1] + centroidY) * currentScale + canvas.height / 2;
			const endX = (arrow[2] - centroidX) * currentScale + canvas.width / 2;
			const endY = (-arrow[3] + centroidY) * currentScale + canvas.height / 2;
			const colour = arrow[4];
			const arrowScale = arrow[5];
			//console.log("Drawing Arrow:", startX, ", ", startY, ", ", endX, ", ", endY, ", ", colour, ", ", arrowScale);
			ctx.strokeStyle = colour;
			ctx.lineWidth = 1;
			drawDirectionArrow(startX, startY, endX, endY, colour, strokeColour, arrowScale);
		}
	}

	if (contour_display === true) {
		// NEW CODE - Further performance improvements
		ctx.lineWidth = 3;

		// Move color assignment outside of the loop if possible
		const firstColor = "magenta";
		for (let i = 0; i < contourLinesArray.length; i++) {
			const contourLines = contourLinesArray[i];
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
		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			ctx.fillStyle = "red";
			ctx.font = "18px Arial"; // Set the font size to 20px
			ctx.fillText("Holes Displayed: " + points.length, 10, canvas.height - 20);
			const x = (points[i].startXLocation - centroidX) * currentScale + canvas.width / 2; // adjust x position
			const y = (-points[i].startYLocation + centroidY) * currentScale + canvas.height / 2; // adjust y position
			const lineStartX = x;
			const lineStartY = y;
			const lineEndX = (points[i].endXLocation - centroidX) * currentScale + canvas.width / 2;
			const lineEndY = (centroidY - points[i].endYLocation) * currentScale + canvas.height / 2;

			toeSizeInMeters = document.getElementById("toeSlider").value;
			connScale = document.getElementById("connSlider").value;
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

// Declare the variables at the top of your script
let lastMouseX = 0;
let lastMouseY = 0;

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	lastMouseX = evt.clientX;
	lastMouseY = evt.clientY;
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

// Register to the canvas to get mouse position
canvas.addEventListener("mousemove", function (evt) {
	var mousePos = getMousePos(canvas, evt);
	//console.log("Mouse position: " + mousePos.x + "," + mousePos.y);
});

function openHelp() {
	shell.open("https://blastingapps.com/kirrausermanual.html");
}

function zoomIn() {
	currentScale += 1; // increase the current scale by 1
	currentFontSize += 1;
	drawData(points, selectedHole);
}

function zoomOut() {
	currentScale = Math.max(0.25, currentScale - 1); // decrease the current scale by 0.25, but not below 1
	currentFontSize -= 1;
	drawData(points, selectedHole);
}

function resetZoom() {
	currentScale = scale; // reset the current scale to the original scale
	currentFontSize = fontSize;

	//calculate the centroids from the data in the maps and points
	updateCentroids();
	drawData(points, selectedHole);
}
///SAVE and LOAD POINTS ARRAY TO LOCAL STORAGE /////////////////////////////////
function saveHolesToLocalStorage(points) {
	if (points !== null) {
		const lines = points.map((point) => {
			//01 = ${point.entityName},
			//02 = ${point.entityType},
			//03 = ${point.holeID},
			//04 = ${point.startXLocation},
			//05 = ${point.startYLocation},
			//06 = ${point.startZLocation},
			//07 = ${point.endXLocation},
			//08 = ${point.endYLocation},
			//09 = ${point.endZLocation},
			//10 = ${point.holeDiameter},
			//11 = ${point.holeType},
			//12 = ${point.fromHoleID},
			//13 = ${point.timingDelayMilliseconds},
			//14 = ${point.colourHexDecimal},
			//15 = ${point.measuredLength},
			//16 = ${point.measuredLengthTimeStamp},
			//17 = ${point.measuredMass},
			//18 = ${point.measuredMassTimeStamp},
			//19 = ${point.measuredComment}
			//20 = ${point.measuredCommentTimeStamp}\n`;

			return `${point.entityName},${point.entityType},${point.holeID},${point.startXLocation},${point.startYLocation},${point.startZLocation},${point.endXLocation},${point.endYLocation},${point.endZLocation},${point.holeDiameter},${point.holeType},${point.fromHoleID},${point.timingDelayMilliseconds},${point.colourHexDecimal},${point.measuredLength},${point.measuredLengthTimeStamp},${point.measuredMass},${point.measuredMassTimeStamp},${point.measuredComment},${point.measuredCommentTimeStamp}\n`;
		});

		const csvString = lines.join("\n");
		const pointsMap = new Map();

		localStorage.setItem("kirraDataPoints", csvString);

		for (const entity of pointsMap.values()) {
			console.log(entity);
		}
	}
	console.log("Points saved to local storage");
	console.log(points);
}

function refreshPoints() {
	saveHolesToLocalStorage(points);
	const playSpeedInput = document.getElementById("playSpeed");
	if (points.length > 1000) {
		playSpeedInput.max = 50;
	} else {
		playSpeedInput.max = 15;
	}
	// Clear the current points array
	points = [];
	console.log("Points array cleared - RefreshPoints()");

	// Load points from local storage
	const csvString = localStorage.getItem("kirraDataPoints");
	if (csvString) {
		points = parseCSV(csvString, null);
		//updateCentroids();
		calculateTimes(points);
		const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

		// directionArrows now contains the arrow data for later drawing

		const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles

		drawData(points, selectedHole);

		// Debugging: Log the points array for each entity
		const pointsMap = new Map();
		for (const point of points) {
			if (!pointsMap.has(point.entityName)) {
				pointsMap.set(point.entityName, { entityName: point.entityName, data: [] });
			}
			pointsMap.get(point.entityName).data.push(point);
		}
		for (const entity of pointsMap.values()) {
			console.log(entity);
		}

		return points;
	}
	return null;
}

// Use this function whenever you need to refresh the state and redraw the canvas
// For example, after deleting a hole or renumbering holes:
// refreshPoints();

function loadHolesFromLocalStorage() {
	// Initialize points as an empty array if it's null
	if (points === null) {
		points = [];
	}
	const csvString = localStorage.getItem("kirraDataPoints");
	console.log(csvString);
	if (csvString) {
		points = parseCSV(csvString);
		console.log(points);
		updateCentroids();
		calculateTimes(points);
		const { contourLinesArray, directionArrows } = recalculateContours(points, deltaX, deltaY);

		// directionArrows now contains the arrow data for later drawing

		const { resultTriangles, reliefTriangles } = delaunayTriangles(points, maxEdgeLength); // Recalculate triangles
		drawData(points, selectedHole);
		//console.log the points array in a blob for each entityname
		const pointsMap = new Map();
		for (const point of points) {
			if (!pointsMap.has(point.entityName)) {
				pointsMap.set(point.entityName, { entityName: point.entityName, data: [] });
			}
			pointsMap.get(point.entityName).data.push(point);
		}
		for (const entity of pointsMap.values()) {
			console.log(entity);
		}
		console.log(points);
		return points;
	}
	return null;
}
///SAVE and LOAD KAD MAPS TO LOCAL STORAGE /////////////////////////////////
function saveKADToLocalStorage(mapData) {
	//mapData = [kadHolesMap, kadPointsMap, kadPolygonsMap, kadLinesMap, kadCirclesMap, kadTextsMap]; //including kadHolesMap
	mapData = [kadPointsMap, kadPolygonsMap, kadLinesMap, kadCirclesMap, kadTextsMap]; //excluding kadHolesMap
	//localStorage.removeItem("kadData");

	let csvContentKAD = "";

	for (const map of mapData) {
		for (const entry of map.entries()) {
			const entityName = entry[0];
			//console.log(entityName);
			const entityData = entry[1];
			//console.log(entityData);

			if (entityData.entityType.trim() === "hole") {
				//commented out holes at this stage as it is duplicating the data
				//console.log(entityData.entityType);
				//for (const hole of entityData.data) {
				//	const csvLine = `${entityName},${hole.entityType},${hole.holeID},${hole.startXLocation},${hole.startYLocation},${hole.startZLocation},${hole.endXLocation},${hole.endYLocation},${hole.endZLocation},${hole.holeDiameter},${hole.holeType},${hole.fromHoleID},${hole.timingDelayMilliseconds},${hole.colourHexDecimal},${hole.holeLengthCalculated},${hole.holeAngle},${hole.holeBearing}\n`;
				//	csvContentKAD += csvLine;
				//}
			} else if (entityData.entityType.trim() === "point") {
				//console.log(entityData.entityType);
				for (const point of entityData.data) {
					const csvLine = `${entityName},${point.entityType},${point.pointID},${point.pointXLocation},${point.pointYLocation},${point.pointZLocation},${point.colour}\n`;
					csvContentKAD += csvLine;
				}
			} else if (entityData.entityType.trim() === "poly") {
				//console.log(entityData.entityType);
				for (const polygon of entityData.data) {
					const csvLine = `${entityName},${polygon.entityType},${polygon.pointID},${polygon.pointXLocation},${polygon.pointYLocation},${polygon.pointZLocation},${polygon.lineWidth},${polygon.colour}\n`;
					csvContentKAD += csvLine;
				}
			} else if (entityData.entityType.trim() === "line") {
				//console.log(entityData.entityType);
				for (const entityLine of entityData.data) {
					const csvLine = `${entityName},${entityLine.entityType},${entityLine.pointID},${entityLine.pointXLocation},${entityLine.pointYLocation},${entityLine.pointZLocation},${entityLine.lineWidth},${entityLine.colour}\n`;
					csvContentKAD += csvLine;
				}
			} else if (entityData.entityType.trim() === "circle") {
				//console.log(entityData.entityType);
				for (const circle of entityData.data) {
					const csvLine = `${entityName},${circle.entityType},${circle.pointID},${circle.pointXLocation},${circle.pointYLocation},${circle.pointZLocation},${circle.radius},${circle.lineWidth},${circle.colour}\n`;
					csvContentKAD += csvLine;
				}
			} else if (entityData.entityType.trim() === "text") {
				//console.log(entityData.entityType);
				for (const text of entityData.data) {
					const csvLine = `${entityName},${text.entityType},${text.pointID},${text.pointXLocation},${text.pointYLocation},${text.pointZLocation},${text.text},${text.colour}\n`;
					csvContentKAD += csvLine;
				}
			}
		}
	}
	console.log("///////////////////KAD DATA//////////////");
	console.log("KAD Points : ", kadPointsMap);
	console.log("KAD Lines : ", kadLinesMap);
	console.log("KAD Polygons : ", kadPolygonsMap);
	console.log("KAD Circles : ", kadCirclesMap);
	console.log("KAD Texts : ", kadTextsMap);
	//console.log(kadHolesMap);
	//console.log("Local Storage kadData: ", csvContentKAD);
	localStorage.setItem("kadData", csvContentKAD);
}
// Load the all Kad maps from Local Storage if they are not null
function loadKADFromLocalStorage() {
	const csvStringKAD = localStorage.getItem("kadData");
	if (csvStringKAD) {
		parseKADFile(csvStringKAD);
		drawData(points, selectedHole);
		//console.log the KAD maps
		console.log(kadHolesMap);
	}
}

function checkLocalStorageData() {
	const csvString = localStorage.getItem("kirraDataPoints");
	const csvStringKAD = localStorage.getItem("kadData");
	if (csvString || csvStringKAD) {
		// Show the popup asking the user if they want to continue from where they left off
		showPopup();
	}
}

function showPopup() {
	const userDecision = confirm("Do you want to pick up from where you left off?\n\nPress OK to continue or Cancel to start fresh.");
	console.log("function showPopup()");
	if (userDecision === true) {
		// User chose to continue, load the data from local storage
		points = loadHolesFromLocalStorage();
		loadKADFromLocalStorage();
	} else {
		// User chose not to continue, do nothing or start fresh
		clearLoadedData();
	}
	//console.log(points);
	drawData(points, selectedHole);
}

function clearLoadedData() {
	localStorage.removeItem("kirraDataPoints");
}
// Listen for changes in the kirraDataPoints key
window.addEventListener("storage", function (event) {
	if (event.key === "kirraDataPoints") {
		console.log("kirraDataPoints changed");
	} else {
		console.log("kirraDataPoints not changed");
	}
});

function updateCentroids() {
	// Calculate centroid of points
	let sumX = 0;
	let sumY = 0;
	let records = 0;
	if (points !== null) {
		for (let i = 0; i < points.length; i++) {
			sumX += points[i].startXLocation;
			sumY += points[i].startYLocation;
			records++;
		}
	}
	if (kadPointsMap.size > 0) {
		for (const entity of kadPointsMap.values()) {
			for (const point of entity.data) {
				sumX += point.pointXLocation;
				sumY += point.pointYLocation;
				records++;
			}
		}
	}
	if (kadPolygonsMap.size > 0) {
		for (const entity of kadPolygonsMap.values()) {
			for (const polygon of entity.data) {
				sumX += polygon.pointXLocation;
				sumY += polygon.pointYLocation;
				records++;
			}
		}
	}
	if (kadLinesMap.size > 0) {
		for (const entity of kadLinesMap.values()) {
			for (const line of entity.data) {
				sumX += line.pointXLocation;
				sumY += line.pointYLocation;
				records++;
			}
		}
	}
	if (kadCirclesMap.size > 0) {
		for (const entity of kadCirclesMap.values()) {
			for (const circle of entity.data) {
				sumX += circle.pointXLocation;
				sumY += circle.pointYLocation;
				records++;
			}
		}
	}
	if (kadTextsMap.size > 0) {
		for (const entity of kadTextsMap.values()) {
			for (const text of entity.data) {
				sumX += text.pointXLocation;
				sumY += text.pointYLocation;
				records++;
			}
		}
	}
	centroidX = sumX / records;
	centroidY = sumY / records;
}

const darkModeToggle = document.getElementById("dark-mode-toggle");
const body = document.body;
const sidenavLeft = document.getElementById("sidenavLeft");
const sidenavRight = document.getElementById("sidenavRight");
//const canvas = document.getElementById("canvas");

// Check if dark mode preference exists in local storage
const darkModePref = localStorage.getItem("darkMode");
if (darkModePref === "true") {
	enableDarkMode();
}

// Function to enable dark mode
function enableDarkMode() {
	body.classList.add("dark-mode");
	sidenavLeft.classList.add("dark-mode");
	sidenavRight.classList.add("dark-mode");
	canvas.classList.add("dark-canvas");
	updateColours(true);
	localStorage.setItem("darkMode", "true");
}

// Function to disable dark mode
function disableDarkMode() {
	body.classList.remove("dark-mode");
	sidenavLeft.classList.remove("dark-mode");
	sidenavRight.classList.remove("dark-mode");
	canvas.classList.remove("dark-canvas");
	updateColours(false);
	localStorage.setItem("darkMode", "false");
}

// Function to update theme-specific colours and refresh UI
function updateColours(isDarkMode) {
	// Adjust fill, stroke, and text colours
	transparentFillColour = isDarkMode ? "rgba(0, 128, 255, 0.3)" : "rgba(128, 255, 0, 0.3)";
	fillColour = isDarkMode ? "darkgrey" : "lightgrey";
	strokeColour = isDarkMode ? "white" : "black";
	textFillColour = isDarkMode ? "white" : "black";
	depthColour = isDarkMode ? "cyan" : "blue";
	angleDipColour = isDarkMode ? "orange" : "darkorange";

	// Redraw chart and canvas if applicable
	if (Array.isArray(holeTimes)) {
		timeChart();
	}
	drawData(points, selectedHole);
}

// Add click event listener for the dark mode toggle button
darkModeToggle.addEventListener("click", () => {
	const isDarkMode = body.classList.contains("dark-mode");
	if (isDarkMode) {
		disableDarkMode();
	} else {
		enableDarkMode();
	}
});

window.addEventListener("load", () => {
	// Check if dark mode preference exists in local storage
	const isDarkMode = localStorage.getItem("darkMode") === "true";
	if (isDarkMode) {
		disableDarkMode();
	} else {
		enableDarkMode();
	}
	// // Adjust fill, stroke, and text colours
	// transparentFillColour = isDarkMode ? "rgba(0, 128, 255, 0.3)" : "rgba(128, 255, 0, 0.3)";
	// fillColour = isDarkMode ? "darkgrey" : "lightgrey";
	// strokeColour = isDarkMode ? "white" : "black";
	// textFillColour = isDarkMode ? "white" : "black";
	// depthColour = isDarkMode ? "cyan" : "blue";
	// angleDipColour = isDarkMode ? "orange" : "darkorange";
	clearCanvas();
	checkLocalStorageData();
});
// When the page is about to be unloaded or closed, you might want to save the points array to session storage to ensure data is not lost
window.addEventListener("beforeunload", () => {
	saveHolesToLocalStorage(points);
	saveKADToLocalStorage(mapData);
});

window.addEventListener("resize", () => {
	canvas.width = document.documentElement.clientWidth - canvasAdjustWidth;
	canvas.height = document.documentElement.clientHeight - document.documentElement.clientHeight * canvasAdjustHeight;
	if (Array.isArray(holeTimes)) {
		timeChart();
	}
	saveHolesToLocalStorage(points);
	saveKADToLocalStorage(mapData);
	drawData(points, selectedHole);
});

let isMobile = false;
// Check if the device is a mobile device
//const isMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isMobileQuery = window.matchMedia("(max-width: 768px)");
if (isMobileQuery.matches) {
	isMobile = true;
} else {
	isMobile = false;
}

function openNavLeft() {
	console.log(isMobile);
	const sidenavHeight = 350; // Change this value to match the actual height of the sidenav
	const screenHeight = window.innerHeight;
	const margin = screenHeight - sidenavHeight;
	//console.log(margin);
	if (isMobile) {
		body.style.bottom = `${margin}px`;
		body.style.transition = "0.5s";
		sidenavLeft.style.left = "0px";
		sidenavLeft.style.top = "60%";
		sidenavLeft.style.width = "100%";
		sidenavLeft.style.height = "350px";
	} else {
		body.style.marginLeft = "315px"; // Push body to the left
		body.style.transition = "0.5s";
		sidenavLeft.style.width = "300px";
		sidenavLeft.style.paddingLeft = "0px";
		sidenavLeft.style.paddingRight = "0px";
		sidenavLeft.style.margin = "0px";
	}
}

function closeNavLeft() {
	if (isMobile) {
		body.style.marginBottom = "0px";
		body.style.transition = "0.5s";
		sidenavLeft.style.left = "-5px";
		sidenavLeft.style.top = "-5px";
		sidenavLeft.style.width = "0px";
		sidenavLeft.style.height = "0px";
		sidenavLeft.style.zIndex = "10";
	} else {
		body.style.marginLeft = "0px";
		body.style.transition = "0.5s";
		sidenavLeft.style.width = "0px";
		sidenavLeft.style.padding = "0px";
		sidenavLeft.style.margin = "0px";
		sidenavLeft.style.zIndex = "10";
	}
}

function openNavRight() {
	if (isMobile) {
		const sidenavHeight = 350; // Change this value to match the actual height of the sidenav
		const screenHeight = window.innerHeight;
		const margin = screenHeight - sidenavHeight;

		body.style.marginBottom = `${margin}px`;
		body.style.transition = "0.5s";
		sidenavRight.style.right = "0px";
		sidenavRight.style.top = "60%";
		sidenavRight.style.width = "100%";
		sidenavRight.style.height = "350px";
		//resize the timechart
		plotly.relayout("timeChart", {
			width: 280
		});
	} else {
		body.style.marginRight = "315px"; // Push body to the left
		body.style.transition = "0.5s";
		sidenavRight.style.width = "300px";
		sidenavRight.style.right = "0";
		sidenavRight.style.paddingLeft = "0px";
		sidenavRight.style.paddingRight = "0px";
		sidenavRight.style.margin = "0px";
		//resize the timechart
		timeChart();
		newWidthRight = 315;
		Plotly.relayout("timeChart", {
			width: newWidthRight - 50
		});
	}
}

function closeNavRight() {
	if (isMobile) {
		body.style.marginBottom = "0%"; // Push body down
		body.style.transition = "0.5s";
		sidenavRight.style.right = "-5px";
		sidenavRight.style.top = "-5px";
		sidenavRight.style.width = "0px";
		sidenavRight.style.height = "0px";
		sidenavRight.style.zIndex = "10";
	} else {
		body.style.marginRight = "0px"; // Reset the margin to default
		body.style.transition = "0.5s";
		sidenavRight.style.width = "0px";
		sidenavRight.style.padding = "0px";
		sidenavRight.style.margin = "0px";
		sidenavRight.style.zIndex = "10";
	}
}

window.openNavLeft = openNavLeft;
window.closeNavLeft = closeNavLeft;
window.openNavRight = openNavRight;
window.closeNavRight = closeNavRight;

// Using SweetAlert Library Create a popup that gets input from the user.
function updatePopup() {
	console.log("function updatePopup()");
	Swal.fire({
		showCancelButton: false,
		confirmButtonText: "Ok",
		html: `
		<svg version="1.1" baseProfile="basic" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="70" height="70" viewBox="-40 0 200 200" stroke-width="3" stroke="white" fill="none" stroke-linecap="round" stroke-linejoin="round">
		<path
			d="M7.53,64.77c-0.36-1.36-0.38-3.99,0.08-5.34c-0.98-2.51-2.88-8.13-2.22-10.9c1.77-5.81-0.07-16.1-0.95-24.92C3.55,18.78,6.31,4.11,7.61,2.26c6.24-5.37,24.76,22.67,29.81,29.81c1.57-0.17,1.91,1.72,1.78,2.93c1.87,2.82,3.54,4.3,7.03,4.17c2.71,0.61,9.25,1.73,11.56,3.31c3.57-1.82,10.55,1.6,12.57-3.03c1.23-0.82,4.4-3.07,3.94-4.96c2.19-1.04,4.21-5.39,5.03-7.5c1.7-4.14,5.96-7.51,8.29-11.14c5.21-6.14,15.78-27.02,20.71-8.09c2.32,9.62,3.98,22.54,1.38,32.15c0.51,1.33,0.58,4.5,0.59,5.92c0.89,1.69,0.82,4.84,0.2,6.61c0.38,2.52-0.66,5.62-2.47,7.4c0.17,1.03,0.2,2.67-0.49,3.55c0,0,3.21,2.42,4.04,4.54c0.84,2.12-0.59,9.51-1.18,12.53c1.32,1.57,2.75,4.67,2.17,6.81c3.3,5.31-0.68,4.27,1.38,8.48c0.69,2.34-0.51,4.65,1.09,6.71c-0.28,1.05-1.39,3.81-1.58,4.93c0.84,2.71-1.41,6.85-2.96,8.97c0,0,0.39,3.85,0.39,3.85c-4.86,1.62-1.02,2.56-4.83,5.13c-3.52,19.49-28.37,34.55-46.94,37.28c-9.52,0.18-23.4-3.44-29-11.64c-3.47-1.2-9.42-2.81-11.05-6.51c-0.68-1.05-4.4-2.51-3.75-4.24c-1.39,0.33-2.04-1.83-2.47-2.76c-3.42,0.24-3.99-8.32-3.55-10.75c0,0-1.68-3.16-1.68-3.16c0.5-1.06,0.12-1.99-0.69-2.66c0.66-1.83,0.58-1.44-1.18-1.87c-0.19-1.23,0.33-2.6-0.69-3.45c0.13-1.01-0.33-2.69-0.8-3.55c-1.65-1.36-1.5-5.44-2.56-7.3c-3.32-1.31-2.49-3.65,0.2-5.23c0.49-1.42-0.47-3.32-1.38-4.34c2.56-1.71-0.74-3.32,1.48-6.41c0.99-2.71,2.11-0.41-0.3-3.85c0.28-2.86,2.84-3.43,3.06-6.9c0.46-1.74-0.61-4.26-1.78-5.52c3.46-0.9,1.88-1.16,1.28-3.65l2.81-3" />
		<path d="M60.64,124.58c1.69,0.63,4,0.19,5.21-1.41c-1.74,0.78-4.01,1.14-4.83-0.99c3.43-2.98-6.5-3.52-1.55,1.73" />
		<path d="M51.44,124.77c-1.56,0.79-4.74,0.05-5.89-2.37c1.6,1.38,3.9,2.71,4.71-0.18c-3.32-3.58,5.44-3.26,2.3,1.74" />
		<path d="M42.74,86.54c-3.68-8.21-9.86-10.1-12.32-6.32c-1.16,1.72-1.56,3.14-2.92,3.74" />
		<path d="M41.19,87.3c0,0-1.04,0.11-2.33,0.63c-1.29,0.52-5.01,0.78-6.4-0.06c-1.39-0.83-2.55-3.2-2.55-3.2" />
		<path d="M72.65,83.88c0,0,0.7-1.47,0.93-2.36c0.22-0.89,0.9-4.5,4.52-4.59c3.62-0.09,5.07,2.18,5.95,3.48s3.41,2.52,3.41,2.52" />
		<path d="M74.1,84.9c2.28,3.42,7.74,2.49,9.25-1.12" />
		<path
			d="M34.46,114.13c1.38,2.59,0.42,5.7,0.55,9.02s6.39,9.58,11.88,10.5c15.33-0.88,26.05,3.26,34.02-13.86c1.31-4.15,4.28-5.58,7.4-7.96c-0.51,2.55-4.26,8.65-5.62,10.91c-1.51,5.29-4.92,13.59-8.8,17.57c-1.11,7.93-2.1,17.62-11.76,19.38c-12.37,1.23-15.89-4.36-15.83-16.05c-2.76-2.08-5.87-7.81-6.95-11.02" />
		<path d="M68.11,149.19c-2.23,4.57-6.63,5.95-11.39,5.32c-3.31-0.23-5.85-2.22-6.95-5.32" />
		<path
			d="M40.3,41.79l0.25,2.02c0.1,0.81-0.53,1.53-1.35,1.53h-1.72l0.71,1.99c0.21,0.58,0.2,1.21-0.03,1.77l-0.25,0.63c-0.25,0.62-0.91,0.97-1.56,0.84c-1.28-0.27-3.16-0.65-3.01-0.5c0.14,0.14,0.77,1.41,1.25,2.38c0.33,0.67,0.27,1.47-0.16,2.09l0,0c-0.31,0.45-0.81,0.74-1.35,0.79L29.2,55.7l0,0c0.57,0.8,0.27,1.93-0.63,2.34l-1.37,0.62l0,0c1.07,0.44,1.13,1.92,0.11,2.46l-0.11,0.06l0,0c1.01,0.72,0.8,2.28-0.37,2.71l-0.08,0.03h0c0.76,0.63,0.57,1.85-0.35,2.21l-1.35,0.53h0c0.93,0.97,1.12,2.43,0.48,3.61l-0.24,0.44c-0.46,0.85-0.86,1.74-1.19,2.65l-1.34,3.7c-0.45,1.24-1.14,2.38-2.04,3.35l-3.23,3.49l-3.33,3.99" />
		<path
			d="M9.75,67.53l4.97-1.74c0.73-0.25,1.29-0.85,1.49-1.6l0.24-0.87c0.25-0.91,0.84-1.69,1.64-2.18l1.78-1.1c1.17-0.72,2.16-1.7,2.88-2.87l1.62-2.6c0.45-0.73,0.99-1.4,1.59-2.01l1.39-1.39c0.33-0.33,0.59-0.73,0.75-1.17l0.79-2.14c0.28-0.76,0.87-1.35,1.63-1.64l0.55-0.21c1.57-0.59,2.65-2.03,2.8-3.7l0.42-4.67" />
		<path
			d="M70.4,44.82l0.99,2.07c0.39,0.81,0.87,1.58,1.43,2.28c0.33,0.42,0.74,0.88,1.06,1.23c0.3,0.33,0.72,0.5,1.16,0.5c0.82-0.01,2.16,0.22,2.46,1.68l0,0l6.54,1.31c0.53,0.11,0.97,0.48,1.16,0.99v0c0.13,0.36,0.45,0.63,0.83,0.69l1.12,0.19c1.15,0.19,2.17,0.86,2.8,1.84l0.64,0.99c0.24,0.38,0.55,0.71,0.91,0.98l1.58,1.18c0.55,0.41,0.99,0.95,1.29,1.57l0.73,1.55c0.3,0.63,0.7,1.2,1.18,1.7c0.77,0.79,2.03,2.05,2.74,2.76c0.34,0.34,0.78,0.58,1.26,0.67c0.42,0.08,0.97,0.19,1.49,0.27c1.24,0.2,2.47-0.38,3.11-1.47l0.87-1.47" />
		<path d="M78.02,45.64c2.43,2.96,7.99,2.96,7.99,2.96s-2.66-2.88-2.07-5.7c0.59-2.81-2-2.29-3.4-3.77c-1.41-1.48,1.11-10.65,1.11-10.65s-5.55,7.4-5.87,9.54" />
		<path
			d="M96.96,28.48c0.83,1.43,1.78,2.22,1.48,5.25s-2.74,5.4-2.74,5.4s-1.04,1.18-1.63,2.66c-0.59,1.48-0.15,5.4-0.67,6.44c-0.52,1.04-1.18,1.41-2.29,1.41c-1.11,0-4.22,0-5.1-1.04c-0.89-1.04-2.07-4.59-2.07-5.7c0-1.11,1.63-1.85,1.63-1.85s-0.74-1.29-0.59-2.51c0.15-1.22,1.09-2.72,2.49-3.25c1.4-0.53,3.65-1.18,4.61-2.59s-0.81-2.74-0.67-4.22C91.56,27,94.44,25,94.44,25" />
		<path d="M14.88,39.54c0.15-0.56,0.71-0.9,1.28-0.76l2.7,0.64c0.54,0.13,1.08-0.18,1.26-0.7l0.76-2.27c0.03-0.09,0.05-0.17,0.05-0.26l0.29-4.23" />
		<path
			d="M18.24,26.66c0.73-0.95,2.05-1.23,3.09-0.64l2.92,1.63c0.29,0.16,0.56,0.35,0.82,0.55l2.55,2.05c1.65,1.32,2.43,3.45,2.02,5.53l-0.59,2.96c-0.05,0.27-0.12,0.52-0.22,0.78c-0.47,1.28-1.94,5.31-2.01,5.31c-0.03,0-0.44,0.92-0.87,1.92c-0.38,0.88-1.64,0.85-1.98-0.05l0,0c-0.34-0.93-2.13-0.98-2,0c0.73,5.26-1.19,4.42-1.44,3.98c-0.25-0.44-0.36-1.56-0.86-3.16c-0.33-1.08-2.04-1.75-2.22-0.64l0.14,0.86c0.5,2.45-1.01,1.49-1.74,0.15c0,0-0.61-4.26-2.02-3.44" />
		<path d="M48.95,81.34c0.27-8.42-0.2-14.05-10.13-14.1c4.07,2.81,4.72,2.2-0.96,2.55c3.59,2.44,5.86,3.03,0,3c0,0,4.88,3.48,4.88,3.48" />
		<path d="M66.51,81.81c-1.86-6.59-4.51-15.84,4.95-15.53c0,0-2.46,3.33-2.46,3.33c4.6-1.37,6.17-4.41,3.86,2.48c3.07-2.83,3.5-3.2,2.27,1.22c-0.8,1.5-3.99,2.59-3.99,2.59" />
		<path d="M56.2,113.69c-10.45-1.63-14.35,2.61-9.02,13.24c1.03,1.95,6.8,4.29,9.02,4.29c2.22,0,9.97-4.36,11.09-10.8c0.49-2.79-1.41-7.53-4.59-7.17c-3.18,0.36-5.19,0.59-5.19,0.59" />
		<path d="M46.88,133.66c0,0,1.11,3.25,1.11,3.25c1.59,4.52,4.14,12.99,10.28,12.28c5.26,0.91,7.22-1.96,8.58-6.51c0.93-2.57,3.04-8.51,3.57-11.14" />
		<path d="M14.63,91.57l-2,3.48c2.78-0.79,3.25-1.37,1.55,1.63c0,0,3.55-2,3.55-2s-4.07,10.36-3.55,9.84c0.52-0.52,3.25-3.92,3.25-3.92l-0.37,8.88l3.99-5.4c-0.06,2.42-6.63,14.46,0,7.47c0.1,1.2-2.39,6.04,0.52,5.84c0.44-0.15-0.37,6.21,0,5.84c5.11-8.5,2.1-0.16,7.91-3.43" />
		<path
			d="M92.23,66.42l2.81,6.88c-1.71,2.48,0.02,3.07,1.63,4.51c-2.6,4.51,2.76,3.87-1.48,7.84c1.93,3.51,6.42,7.84,10.21,9.25c-4.4,2.3-2.16,2.64,0,5.55c0,0-2.81,4.29-2.81,4.29c0.84,2.23,1.99,3.22-1.11,3.99c0,0,2.07,2,1.85,2s-6.21,0-6.21,0l1.33,3.25c-2.8,1.8-4.5,1.5-1.48,4.66c-2.16-0.37-4.47-2.5-1.48,1.16" />
		<path d="M42.74,90.17c0,0-1.63,3.66-2.51,4.96c-0.89,1.29-3.95,3.37-5.77,4.22c-1.82,0.84-3.6,1.58-4.96,2.29s-3.77,2.24-4.51,1.04c-0.74-1.21-1.48-9.69-0.74-11.1c0.74-1.41,1.92,4.62,4.14,4.84c0.59,0.08,0.81,0.82,1.52,0.85s1.74,0.07,1.74,0.07" />
		<path d="M74.92,91.57c0,0,1.8,4.66,3.18,6.73c1.38,2.07,3.25,4.04,4.29,4.81s3.06,1.7,4.07,1.7c1.01,0,0.91-1.58,1.63-2.15c0.72-0.57,2.22-2.74,2.22-3.77c0-1.04-1.23-2.01-0.89-3.03c0.35-1.02,1.85-1.87,0.89-2.62c-0.96-0.76-4.29,2.18-4.29,2.18" />
		<path d="M38.02,82.31c0,1.37-1.11,2.48-2.48,2.48c-1.37,0-2.48-1.11-2.48-2.48c0-1.37,1.11-2.48,2.48-2.48" />
		<path d="M77.98,78.29c1.37,0,2.48,1.11,2.48,2.48c0,1.37-1.11,2.48-2.48,2.48s-2.48-1.11-2.48-2.48" />
		<path d="M39.21,82.75c0,2.21-1.79,4.01-4.01,4.01c-2.21,0-4.01-1.79-4.01-4.01c0-2.21,1.79-4.01,4.01-4.01" />
		<path d="M78.23,77.22c2.21,0,4.01,1.79,4.01,4.01c0,2.21-1.79,4.01-4.01,4.01c-2.21,0-4.01-1.79-4.01-4.01" />
		<path d="M65.76,119.94c0,0-0.8-2.02-2.61-2.63c-1.81-0.61-4.99-0.91-6.88-0.92s-3.11,0.63-4.16,0c-1.05-0.63-1.66-1.39-1.66-1.39" />
	</svg>
		<br>
			<label class="labelWhite18">Update:</label>
			<br><label class="labelWhite18">NEW FEATURES - Simple Burden Relief </label>
			<br><label class="labelWhite12c"> </label>
			<br><label class="labelWhite12c">EXISTING BUGS - Northing Adjust On/Off.</label>
			<br><label class="labelWhite12c">IMPROVEMENT - Help! User Manual Link</label>
			<br><br>
			<a href="https://www.buymeacoffee.com/BrentBuffham">
          <img src="https://img.buymeacoffee.com/button-api/?text=Buy Brent a coffee&emoji=&slug=BrentBuffham&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" />
        </a>
        <br>
        <a href="mailto:blastingapps.xyz@gmail.com?subject=Bug%20Report%20or%20Feature%20request&body=
          Application%20the%20issue%20or%20request%20is%20about:%0D%0A%0D%0A
          Description%20of%20the%20bug%20or%20feature:%0D%0A%0D%0A
          Steps%20to%20reproduce%20the%20bug%20or%20create%20the%20feature:%0D%0A%0D%0A
          Expected%20result:%0D%0A%0D%0A
          Actual%20result:%0D%0A%0D%0A
        ">
          <button class="button-bug">Report Bug / Request Feature</button>
        </a>
	  `,
		customClass: { container: "custom-popup-container", title: "swal2-title", confirmButton: "confirm", content: "swal2-content", htmlContainer: "swal2-html-container", icon: "swal2-icon" }
	}).then((result) => {
		if (result.isConfirmed) {
		}
	});
}
// Add an event listener for the "DOMContentLoaded" event
document.addEventListener("DOMContentLoaded", function () {
	// Call the updatePopup function when the page is fully loaded
	updatePopup();
});
