export const getParents = (node: Element | Node): Element[] => {
	let el: Element | null =
		node instanceof Node && node.nodeType === Node.TEXT_NODE
			? node.parentElement
			: (node as Element);

	let parents: Element[] = [];
	while (el && (el = el.parentElement)) {
		parents.push(el);
	}
	return parents;
}