export const textNodesUnder = (el: Element) => {
	let n: Node | null = null;
	const a: Node[] = [];
	const walk = document.createTreeWalker(
		el,
		NodeFilter.SHOW_TEXT,
		null,
		false
	);

	while ((n = walk.nextNode())) {
		a.push(n);
	}

	if (el.shadowRoot) {
		const shadowWalk = document.createTreeWalker(
			el.shadowRoot,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		while ((n = shadowWalk.nextNode())) {
			a.push(n);
		}
	}

	return a;
}