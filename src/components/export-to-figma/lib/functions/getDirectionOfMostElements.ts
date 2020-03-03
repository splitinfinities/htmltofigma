import { getBoundingClientRect } from "./getBoundingClientRect";

export const getDirectionMostOfElements = (direction: "left" | "right" | "top" | "bottom", elements: Element[]) => {
	if (elements.length === 1) {
		return elements[0];
	}
	return elements.reduce(
		(memo, value: Element) => {
			if (!memo) {
				return value;
			}

			if (direction === "left" || direction === "top") {
				if (
					getBoundingClientRect(value)[direction] <
					getBoundingClientRect(memo)[direction]
				) {
					return value;
				}
			} else {
				if (
					getBoundingClientRect(value)[direction] >
					getBoundingClientRect(memo)[direction]
				) {
					return value;
				}
			}
			return memo;
		},
		null as Element | null
	);
}