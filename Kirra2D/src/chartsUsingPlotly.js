import { drawData } from "./drawingData.js";
import { setTimingWindowHolesSelected, timingWindowHolesSelected } from "./kirra.js";
import SimpleModal from "./modals/simpleModal.js";

const isDarkMode = document.body.classList.contains("dark-mode");
const noneColour = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue("--dark-mode-canvas").trim() : getComputedStyle(document.documentElement).getPropertyValue("--light-mode-canvas").trim();
const textFillColour = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue("--dark-mode-text").trim() : getComputedStyle(document.documentElement).getPropertyValue("--light-mode-text").trim();
const defaultBarColor = getComputedStyle(document.documentElement).getPropertyValue("--selected-color").trim();
const clickedBarColor = "lime";
const chartContainer = document.getElementById("timeChartContainer");
const timeRange = parseInt(document.getElementById("timeRange").value);

/**
 *
 */
export function resizeChart() {
	const isDarkMode = document.body.classList.contains("dark-mode");
	const newWidth = document.documentElement.clientWidth;
	const defaultBarColor = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue("--selected-color").trim() : getComputedStyle(document.documentElement).getPropertyValue("--default-background-color").trim();

	if (chartContainer) {
		if (!chartContainer.data) {
			console.error("Chart is not initialized. Ensure Plotly.newPlot is called before resizing.");
			return;
		}

		if (isNaN(newWidth) || newWidth <= 0) {
			console.error("Invalid newWidth value:", newWidth);
			return;
		}

		chartContainer.style.width = `${newWidth}px`;

		try {
			Plotly.relayout(chartContainer, { width: newWidth }).catch((error) => console.error("Error resizing chart:", error));
			console.log("Chart Size Updated to Width:", newWidth);
		} catch (error) {
			console.error("Error during Plotly.relayout:", error);
		}
	} else {
		console.error("timeChartContainer not found in the DOM.");
	}
}

/**
 *
 * @param {*} holeTimes
 * @param {*} points
 * @param {*} selectedHole
 */
export function timeChart(holeTimes, points, selectedHole) {
	if (Array.isArray(holeTimes)) {
		const times = holeTimes.map((time) => time[1]);
		const maxTime = Math.max(...times);
		const numBins = Math.ceil(maxTime / timeRange);
		let counts = [];
		try {
			counts = Array(numBins).fill(0);
		} catch (error) {
			new SimpleModal({
				title: "Error",
				message: `Error Initializing Counts Array: ${error.message}\n${error.stack}`,
				buttons: [
					{
						text: "OK",
						onClick: () => {
							console.log("Error modal closed");
						}
					}
				]
			});
		}

		for (let i = 0; i < times.length; i++) {
			const binIndex = Math.floor(times[i] / timeRange);
			counts[binIndex]++;
		}

		const binEdges = Array(numBins)
			.fill(0)
			.map((_, index) => index * timeRange);
		const holeIDs = Array(numBins).fill(null);

		// Populate holeIDs array
		points.forEach((point) => {
			const binIndex = Math.floor(point.holeTime / timeRange);
			holeIDs[binIndex] = holeIDs[binIndex] || [];
			holeIDs[binIndex].push(`${point.entityName}:${point.holeID}`);
		});

		const entityholeIDTexts = holeIDs.map((bin) => {
			if (bin) {
				return bin
					.map((combinedID) => {
						const [entityName, holeID] = combinedID.split(":");
						const point = points.find((p) => p.entityName === entityName && p.holeID === holeID);
						return point ? `${point.entityName}:${point.holeID}` : "";
					})
					.filter((text) => text)
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
				marker: { color: defaultColour },
				text: entityholeIDTexts,
				hoverinfo: "y+text"
			}
		];

		const maxHolesPerBin = Math.max(...counts);
		const layout = {
			title: {
				text: "Time Window Chart",
				xanchor: "right",
				font: { size: 10 }
			},
			plot_bgcolor: noneColour,
			paper_bgcolor: noneColour,
			font: { color: textFillColour },
			xaxis: {
				title: {
					text: "Milliseconds (ms)",
					font: { size: 10 }
				},
				showgrid: true
			},
			yaxis: {
				title: {
					text: "Holes Firing",
					font: { size: 10 }
				},
				range: [0, maxHolesPerBin + 1],
				showgrid: true
			},
			height: 380,
			width: 280
		};

		const config = {
			responsive: true,
			displayModeBar: true,
			modeBarButtonsToRemove: ["lasso2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
		};

		Plotly.newPlot("timeChartContainer", data, layout, config);

		let lastClickedIndex = null;

		// Box and Lasso Selection Listener
		chartContainer.on("plotly_selected", (eventData) => {
			if (eventData?.points) {
				const selectedPoints = eventData.points.map((p) => p.pointNumber);
				const newColours = defaultColour.map((color, index) => (selectedPoints.includes(index) ? "lime" : color));
				Plotly.restyle(chartContainer, { "marker.color": [newColours] });

				setTimingWindowHolesSelected(
					selectedPoints
						.flatMap((index) => {
							return (
								holeIDs[index]?.map((combinedID) => {
									const [entityName, holeID] = combinedID.split(":");
									return points.find((p) => p.entityName === entityName && p.holeID === holeID);
								}) || []
							);
						})
						.filter((point) => point)
				);

				console.log("timingWindowHolesSelected:", timingWindowHolesSelected);

				drawData(points, selectedHole);
			} else {
				Plotly.restyle(chartContainer, { "marker.color": [defaultColour] });
				setTimingWindowHolesSelected([]);
				drawData(points, selectedHole);
			}
		});

		// Single Bar Click Event
		chartContainer.on("plotly_click", (data) => {
			if (data.points?.length) {
				const clickedIndex = data.points[0].pointIndex;
				const clickedBarColor = "lime";
				const currentColors = [...data.points[0].data.marker.color];
				if (lastClickedIndex !== null) {
					currentColors[lastClickedIndex] = "red";
				}
				currentColors[clickedIndex] = clickedBarColor;
				Plotly.restyle("timeChartContainer", { "marker.color": [currentColors] });
				lastClickedIndex = clickedIndex;

				setTimingWindowHolesSelected(
					holeIDs[clickedIndex]?.map((combinedID) => {
						const [entityName, holeID] = combinedID.split(":");
						return points.find((p) => p.entityName === entityName && p.holeID === holeID);
					}) || []
				);

				console.log("timingWindowHolesSelected:", timingWindowHolesSelected);
				drawData(points, selectedHole);
			} else {
				setTimingWindowHolesSelected([]);
				lastClickedIndex = null;
				drawData(points, selectedHole);
			}
		});

		// Reset Selection Event
		chartContainer.on("plotly_deselect", () => {
			Plotly.restyle(chartContainer, { "marker.color": [defaultColour] });
			timingWindowHolesSelected = [];
			drawData(points, selectedHole);
			lastClickedIndex = null;
			console.log("Chart reset to unselected state.");
		});
	}
}
