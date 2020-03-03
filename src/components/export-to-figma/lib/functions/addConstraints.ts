import { traverse } from "./traverse";
import { setData } from "./setData";

export const addConstraints = (root, layers: LayerNode[]) => {

	layers.forEach(layer => {
		traverse(layer, child => {
			if (child.type === "SVG") {
				child.constraints = {
					horizontal: "CENTER",
					vertical: "MIN"
				};
			} else {
				const ref = child.ref;
				if (ref) {
					const el = ref instanceof HTMLElement ? ref : ref.parentElement;
					const parent = el && el.parentElement;
					if (el && parent) {
						const currentDisplay = el.style.display;
						el.style.setProperty('display', 'none', '!important')
						let computed = getComputedStyle(el);
						const hasFixedWidth = computed.width && computed.width.trim().endsWith('px')
						const hasFixedHeight = computed.height && computed.height.trim().endsWith('px')
						el.style.display = currentDisplay;
						const parentStyle = getComputedStyle(parent);
						let hasAutoMarginLeft = computed.marginLeft === "auto";
						let hasAutoMarginRight = computed.marginRight === "auto";
						let hasAutoMarginTop = computed.marginTop === "auto";
						let hasAutoMarginBottom = computed.marginBottom === "auto";

						computed = getComputedStyle(el);

						if (["absolute", "fixed"].includes(computed.position!)) {
							setData(child, 'position', computed.position!)
						}

						if (hasFixedHeight) {
							setData(child, 'heightType', 'fixed')
						}
						if (hasFixedWidth) {
							setData(child, 'widthType', 'fixed')
						}

						const isInline =
							computed.display && computed.display.includes("inline");

						if (isInline) {
							const parentTextAlign = parentStyle.textAlign;
							if (parentTextAlign === "center") {
								hasAutoMarginLeft = true;
								hasAutoMarginRight = true;
							} else if (parentTextAlign === "right") {
								hasAutoMarginLeft = true;
							}

							if (computed.verticalAlign === "middle") {
								hasAutoMarginTop = true;
								hasAutoMarginBottom = true;
							} else if (computed.verticalAlign === "bottom") {
								hasAutoMarginTop = true;
								hasAutoMarginBottom = false;
							}

							setData(child, 'widthType', 'shrink')
						}
						const parentJustifyContent =
							parentStyle.display === "flex" &&
							((parentStyle.flexDirection === "row" &&
								parentStyle.justifyContent) ||
								(parentStyle.flexDirection === "column" &&
									parentStyle.alignItems));

						if (parentJustifyContent === "center") {
							hasAutoMarginLeft = true;
							hasAutoMarginRight = true;
						} else if (
							parentJustifyContent &&
							(parentJustifyContent.includes("end") ||
								parentJustifyContent.includes("right"))
						) {
							hasAutoMarginLeft = true;
							hasAutoMarginRight = false;
						}

						const parentAlignItems =
							parentStyle.display === "flex" &&
							((parentStyle.flexDirection === "column" &&
								parentStyle.justifyContent) ||
								(parentStyle.flexDirection === "row" &&
									parentStyle.alignItems));
						if (parentAlignItems === "center") {
							hasAutoMarginTop = true;
							hasAutoMarginBottom = true;
						} else if (
							parentAlignItems &&
							(parentAlignItems.includes("end") ||
								parentAlignItems.includes("bottom"))
						) {
							hasAutoMarginTop = true;
							hasAutoMarginBottom = false;
						}

						if (child.type === "TEXT") {
							if (computed.textAlign === "center") {
								hasAutoMarginLeft = true;
								hasAutoMarginRight = true;
							} else if (computed.textAlign === "right") {
								hasAutoMarginLeft = true;
								hasAutoMarginRight = false;
							}
						}

						child.constraints = {
							horizontal:
								hasAutoMarginLeft && hasAutoMarginRight
									? "CENTER"
									: hasAutoMarginLeft
										? "MAX"
										: "SCALE",
							vertical:
								hasAutoMarginBottom && hasAutoMarginTop
									? "CENTER"
									: hasAutoMarginTop
										? "MAX"
										: "MIN"
						};
					}
				} else {
					child.constraints = {
						horizontal: "SCALE",
						vertical: "MIN"
					};
				}
			}
		});
	});

	return { root, layers };
}