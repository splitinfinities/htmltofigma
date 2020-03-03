export const isHidden = (element: Element) => {
	let el: Element | null = element;
	do {
		const computed = getComputedStyle(el);
		if (
			// computed.opacity === '0' ||
			computed.display === "none" ||
			computed.visibility === "hidden"
		) {
			return true;
		}
		// Some sites hide things by having overflow: hidden and height: 0, e.g. dropdown menus that animate height in
		if (
			computed.overflow !== "visible" &&
			el.getBoundingClientRect().height < 1
		) {
			return true;
		}
	} while ((el = el.parentElement));
	return false;
}