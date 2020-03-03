import { getBoundingClientRect } from "./getBoundingClientRect";
import { getDirectionMostOfElements } from "./getDirectionOfMostElements";

export const getAggregateRectOfElements = (elements: Element[]) => {
	if (!elements.length) {
		return null;
	}

	const top = getBoundingClientRect(
		getDirectionMostOfElements("top", elements)!
	).top;
	const left = getBoundingClientRect(
		getDirectionMostOfElements("left", elements)!
	).left;
	const bottom = getBoundingClientRect(
		getDirectionMostOfElements("bottom", elements)!
	).bottom;
	const right = getBoundingClientRect(
		getDirectionMostOfElements("right", elements)!
	).right;
	const width = right - left;
	const height = bottom - top;
	return {
		top,
		left,
		bottom,
		right,
		width,
		height
	};
}