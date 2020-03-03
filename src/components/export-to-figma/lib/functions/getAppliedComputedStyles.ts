import { pick } from "./pick";

export const getAppliedComputedStyles = (element: Element, pseudo?: string): { [key: string]: string } => {
	if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
		return {};
	}

	const styles = getComputedStyle(element, pseudo);

	const list: (keyof React.CSSProperties)[] = [
		"opacity",
		"backgroundColor",
		"border",
		"borderTop",
		"borderLeft",
		"borderRight",
		"borderBottom",
		"borderRadius",
		"backgroundImage",
		"borderColor",
		"boxShadow"
	];

	const color = styles.color;

	return pick(styles, list as any, color) as any;
}