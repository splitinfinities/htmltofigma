import { getAggregateRectOfElements } from "./getAggregateRectOfElements";

export const getBoundingClientRect = (el: Element): ClientRect => {
	const computed = getComputedStyle(el);
	const display = computed.display;

	if (display && display.includes("inline") && el.children.length) {
		const elRect = el.getBoundingClientRect();
		const aggregateRect = getAggregateRectOfElements(
			Array.from(el.children)
		)!;

		return {
			...aggregateRect,
			height: elRect.height,
			width: elRect.width,
			top: elRect.top,
			bottom: elRect.bottom,
			left: elRect.left,
			right: elRect.right
		};
	}

	return el.getBoundingClientRect();
}
