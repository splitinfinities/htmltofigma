import { isLength } from "./isLength";
import { toNum } from "./toNum";

export const parseValue = (str: string): ParsedBoxShadow => {
	// TODO: this is broken for multiple box shadows
	if (str.startsWith("rgb")) {
		// Werid computed style thing that puts the color in the front not back
		const colorMatch = str.match(/(rgba?\(.+?\))(.+)/);
		if (colorMatch) {
			str = (colorMatch[2] + " " + colorMatch[1]).trim();
		}
	}

	const PARTS_REG = /\s(?![^(]*\))/;
	const parts = str.split(PARTS_REG);
	const inset = parts.includes("inset");
	const last = parts.slice(-1)[0];
	const color = !isLength(last) ? last : "rgba(0, 0, 0, 1)";

	const nums = parts
		.filter(n => n !== "inset")
		.filter(n => n !== color)
		.map(toNum);

	const [offsetX, offsetY, blurRadius, spreadRadius] = nums;

	return {
		inset,
		offsetX,
		offsetY,
		blurRadius,
		spreadRadius,
		color
	};
};