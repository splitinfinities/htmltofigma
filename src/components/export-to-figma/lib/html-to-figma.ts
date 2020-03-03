import { isHidden } from "./functions/isHidden";
import { getAppliedComputedStyles } from "./functions/getAppliedComputedStyles";
import { size } from "./functions/size";
import { getBoundingClientRect } from "./functions/getBoundingClientRect";
import { getRgb } from "./functions/getRgb";
import { capitalize } from "./functions/capitalize";
import { getUrl } from "./functions/getUrl";
import { parseValue } from "./functions/parseValue";
import { parseUnits } from "./functions/parseUnits";
import { textNodesUnder } from "./functions/textNodesUnder";
import { makeTree } from "./functions/makeTree";
import { addConstraints } from "./functions/addConstraints";
import { removeRefs } from "./functions/removeRefs";

// export const selectorToFigma(selector: string = "body", useFrames = false, time = false) {

// }

// export const nodeToFigma(element: HTMLElement, useFrames = false, time = false) {

// }


export const htmlToFigma = (selector: HTMLElement | string = "body", useFrames = false, time = false) => {

	if (time) {
		console.time("Parse dom");
	}

	let layers: LayerNode[] = [];
	const el = selector instanceof HTMLElement ? selector : document.querySelector(selector || "body");

	if (el) {
		// Process SVG <use> elements
		for (const use of Array.from(el.querySelectorAll("use"))) {
			try {
				const symbolSelector = use.href.baseVal;
				const symbol: SVGSymbolElement | null = document.querySelector(
					symbolSelector
				);
				if (symbol) {
					use.outerHTML = symbol.innerHTML;
				}
			} catch (err) {
				console.warn("Error querying <use> tag href", err);
			}
		}

		let els = Array.from(el.querySelectorAll("*"));

		if (el.shadowRoot) {
			const shadowEls = Array.from(el.shadowRoot.querySelectorAll("*"));

			els = [...shadowEls, ...els];
			els = els.filter(e => !["EXPORT-TO-FIGMA", "SLOT"].includes(e.tagName))
		}

		if (els) {
			// Include shadow dom
			for (const el of els) {
				if (el.shadowRoot) {
					const shadowEls = Array.from(el.shadowRoot.querySelectorAll('*'));
					els.push(...shadowEls);
				}
			}

			Array.from(els).forEach(el => {
				if (isHidden(el)) {
					return;
				}
				if (el instanceof SVGSVGElement) {
					const rect = el.getBoundingClientRect();

					// TODO: pull in CSS/computed styles
					// TODO: may need to pull in layer styles too like shadow, bg color, etc
					layers.push({
						type: "SVG",
						ref: el,
						svg: el.outerHTML,
						x: Math.round(rect.left),
						y: Math.round(rect.top),
						width: Math.round(rect.width),
						height: Math.round(rect.height)
					});
					return;
				}
				// Sub SVG Eleemnt
				else if (el instanceof SVGElement) {
					return;
				}

				if (
					el.parentElement &&
					el.parentElement instanceof HTMLPictureElement
				) {
					return;
				}

				const appliedStyles = getAppliedComputedStyles(el);
				const computedStyle = getComputedStyle(el);

				if (
					(size(appliedStyles) ||
						el instanceof HTMLImageElement ||
						el instanceof HTMLPictureElement ||
						el instanceof HTMLVideoElement) &&
					computedStyle.display !== "none"
				) {
					const rect = getBoundingClientRect(el);

					if (rect.width >= 1 && rect.height >= 1) {
						const fills: Paint[] = [];

						let color = getRgb(computedStyle.backgroundColor);


						if (computedStyle.background.includes("gradient")) {
							// @ts-ignore
							var match = [...computedStyle.background.matchAll(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/g)];
							color = getRgb(match[1][0])
						}

						// TODO: Add support for gradients

						if (color) {
							fills.push({
								type: "SOLID",
								color: {
									r: color.r,
									g: color.g,
									b: color.b
								},
								opacity: color.a || 1
							} as SolidPaint);
						}

						const rectNode = {
							type: "RECTANGLE",
							ref: el,
							x: Math.round(rect.left),
							y: Math.round(rect.top),
							width: Math.round(rect.width),
							height: Math.round(rect.height),
							fills: fills as any
						} as WithRef<RectangleNode>;

						if (computedStyle.border) {
							const parsed = computedStyle.border.match(
								/^([\d\.]+)px\s*(\w+)\s*(.*)$/
							);
							if (parsed) {
								// @ts-ignore
								let [_, width, type, color] = parsed;
								if (width && width !== "0" && type !== "none" && color) {
									const rgb = getRgb(color);
									if (rgb) {
										rectNode.strokes = [
											{
												type: "SOLID",
												color: { r: rgb.r, b: rgb.b, g: rgb.g },
												opacity: rgb.a || 1
											}
										];
										rectNode.strokeWeight = Math.round(parseFloat(width));
									}
								}
							}
						}

						if (!rectNode.strokes) {
							const directions = ["top", "left", "right", "bottom"];
							for (const dir of directions) {
								const computed = computedStyle[("border" + capitalize(dir)) as any];
								if (computed) {
									const parsed = computed.match(/^([\d\.]+)px\s*(\w+)\s*(.*)$/);
									if (parsed) {
										// @ts-ignore
										let [_match, borderWidth, type, color] = parsed;
										if (
											borderWidth &&
											borderWidth !== "0" &&
											type !== "none" &&
											color
										) {
											const rgb = getRgb(color);
											if (rgb) {

												debugger;

												const width = ["top", "bottom"].includes(dir)
													? rect.width
													: parseFloat(borderWidth);
												const height = ["left", "right"].includes(dir)
													? rect.height
													: parseFloat(borderWidth);
												layers.push({
													ref: el,
													type: "RECTANGLE",
													x:
														dir === "left"
															? rect.left - width
															: dir === "right"
																? rect.right
																: rect.left,
													y:
														dir === "top"
															? rect.top - height
															: dir === "bottom"
																? rect.bottom
																: rect.top,
													width,
													height,
													fills: [
														{
															type: "SOLID",
															color: { r: rgb.r, b: rgb.b, g: rgb.g },
															opacity: rgb.a || 1
														} as SolidPaint
													] as any
												} as WithRef<RectangleNode>);
											}
										}
									}
								}
							}
						}

						if (computedStyle.backgroundImage && computedStyle.backgroundImage !== "none") {
							const urlMatch = computedStyle.backgroundImage.match(
								/url\(['"]?(.*?)['"]?\)/
							);
							const url = urlMatch && urlMatch[1];
							if (url) {
								fills.push({
									url,
									type: "IMAGE",
									// TODO: backround size, position
									scaleMode: computedStyle.backgroundSize === "contain" ? "FIT" : "FILL",
									imageHash: null
								} as ImagePaint);
							}
						}
						if (el instanceof SVGSVGElement) {
							const url = `data:image/svg+xml,${encodeURIComponent(
								el.outerHTML.replace(/\s+/g, " ")
							)}`;
							if (url) {
								fills.push({
									url,
									type: "IMAGE",
									// TODO: object fit, position
									scaleMode: "FILL",
									imageHash: null
								} as ImagePaint);
							}
						}

						if (el instanceof HTMLImageElement) {
							const url = el.src;
							if (url) {
								fills.push({
									url,
									type: "IMAGE",
									// TODO: object fit, position
									scaleMode:
										computedStyle.objectFit === "contain" ? "FIT" : "FILL",
									imageHash: null
								} as ImagePaint);
							}
						}

						if (el instanceof HTMLPictureElement) {
							const firstSource = el.querySelector("source");
							if (firstSource) {
								const src = getUrl(firstSource.srcset.split(/[,\s]+/g)[0]);
								// TODO: if not absolute
								if (src) {
									fills.push({
										url: src,
										type: "IMAGE",
										// TODO: object fit, position
										scaleMode:
											computedStyle.objectFit === "contain" ? "FIT" : "FILL",
										imageHash: null
									} as ImagePaint);
								}
							}
						}

						if (el instanceof HTMLVideoElement) {
							const url = el.poster;
							if (url) {
								fills.push({
									url,
									type: "IMAGE",
									// TODO: object fit, position
									scaleMode:
										computedStyle.objectFit === "contain" ? "FIT" : "FILL",
									imageHash: null
								} as ImagePaint);
							}
						}

						if (computedStyle.boxShadow && computedStyle.boxShadow !== "none") {
							const parsed = parseValue(computedStyle.boxShadow);
							const color = getRgb(parsed.color);
							if (color) {
								rectNode.effects = [
									{
										color,
										type: "DROP_SHADOW",
										radius: parsed.blurRadius,
										blendMode: "NORMAL",
										visible: true,
										offset: {
											x: parsed.offsetX,
											y: parsed.offsetY
										}
									} as ShadowEffect
								];
							}
						}

						const borderTopLeftRadius = parseUnits(
							computedStyle.borderTopLeftRadius
						);
						if (borderTopLeftRadius) {
							rectNode.topLeftRadius = borderTopLeftRadius.value;
						}
						const borderTopRightRadius = parseUnits(
							computedStyle.borderTopRightRadius
						);
						if (borderTopRightRadius) {
							rectNode.topRightRadius = borderTopRightRadius.value;
						}
						const borderBottomRightRadius = parseUnits(
							computedStyle.borderBottomRightRadius
						);
						if (borderBottomRightRadius) {
							rectNode.bottomRightRadius = borderBottomRightRadius.value;
						}
						const borderBottomLeftRadius = parseUnits(
							computedStyle.borderBottomLeftRadius
						);
						if (borderBottomLeftRadius) {
							rectNode.bottomLeftRadius = borderBottomLeftRadius.value;
						}

						layers.push(rectNode);
					}
				}
			});
		}

		const textNodes = textNodesUnder(el);

		const fastClone = (data: any) => JSON.parse(JSON.stringify(data));

		for (const node of textNodes) {
			if (node.textContent && node.textContent.trim().length) {
				// @ts-ignore
				const parent = node.assignedSlot ? node.assignedSlot.parentElement : node.parentElement;
				if (parent) {
					if (isHidden(parent)) {
						continue;
					}
					// @ts-ignore
					const computedStyles = getComputedStyle(parent);
					const range = document.createRange();
					range.selectNode(node);
					const rect = fastClone(range.getBoundingClientRect());
					const lineHeight = parseUnits(computedStyles.lineHeight);
					range.detach();
					if (lineHeight && rect.height < lineHeight.value) {
						const delta = lineHeight.value - rect.height;
						rect.top -= delta / 2;
						rect.height = lineHeight.value;
					}
					if (rect.height < 1 || rect.width < 1) {
						continue;
					}

					const textNode = {
						x: Math.round(rect.left),
						ref: node,
						y: Math.round(rect.top),
						width: Math.round(rect.width),
						height: Math.round(rect.height),
						type: "TEXT",
						characters: node.textContent.trim().replace(/\s+/g, " ") || ""
					} as WithRef<TextNode>;

					const fills: SolidPaint[] = [];
					console.log(computedStyles)
					const rgb = getRgb(computedStyles.color);

					if (rgb) {
						fills.push({
							type: "SOLID",
							color: {
								r: rgb.r,
								g: rgb.g,
								b: rgb.b
							},
							opacity: rgb.a || 1
						} as SolidPaint);
					}

					if (fills.length) {
						textNode.fills = fills;
					}
					const letterSpacing = parseUnits(computedStyles.letterSpacing);
					if (letterSpacing) {
						textNode.letterSpacing = letterSpacing;
					}

					if (lineHeight) {
						textNode.lineHeight = lineHeight;
					}

					const { textTransform } = computedStyles;
					switch (textTransform) {
						case "uppercase": {
							textNode.textCase = "UPPER";
							break;
						}
						case "lowercase": {
							textNode.textCase = "LOWER";
							break;
						}
						case "capitalize": {
							textNode.textCase = "TITLE";
							break;
						}
					}

					const fontSize = parseUnits(computedStyles.fontSize);
					if (fontSize) {
						textNode.fontSize = Math.round(fontSize.value);
					}
					if (computedStyles.fontFamily) {
						// const font = computedStyles.fontFamily.split(/\s*,\s*/);
						(textNode as any).fontFamily = computedStyles.fontFamily;
					}

					if (computedStyles.textDecoration) {
						if (
							computedStyles.textDecoration === "underline" ||
							computedStyles.textDecoration === "strikethrough"
						) {
							textNode.textDecoration = computedStyles.textDecoration.toUpperCase() as any;
						}
					}
					if (computedStyles.textAlign) {
						if (
							["left", "center", "right", "justified"].includes(
								computedStyles.textAlign
							)
						) {
							textNode.textAlignHorizontal = computedStyles.textAlign.toUpperCase() as any;
						}
					}

					layers.push(textNode);
				}
			}
		}
	}

	const computedStyle = getComputedStyle(el);

	const rgb = getRgb(computedStyle.backgroundColor)
	delete rgb.a

	const background: Paint = {
		type: "SOLID",
		color: rgb,
		visible: true,
		opacity: Number(computedStyle.opacity)
	}

	// TODO: send frame: { children: []}
	let root = {
		type: "FRAME",
		// @ts-ignore
		width: el ? Math.round(el.offsetWidth) : Math.round(window.innerWidth),
		// @ts-ignore
		height: el ? Math.round(el.offsetHeight) : Math.round(window.innerHeight),
		x: 0,
		y: 0,
		ref: el,
		backgrounds: [background]
	} as WithRef<FrameNode>;

	layers.unshift(root);

	// TODO: arg can be passed in
	const MAKE_TREE = useFrames;

	let result;

	if (MAKE_TREE) {
		(root as any).children = layers.slice(1);

		result = makeTree(root, layers);
		root = result.root;
		layers = result.layers;

		result = addConstraints(root, layers);
		root = result.root;
		layers = result.layers;

		result = removeRefs(root, layers);
		root = result.root;
		layers = result.layers;

		if (time) {
			console.info("\n");
			console.timeEnd("Parse dom");
		}

		return { "layers": [root] };
	}

	result = removeRefs(root, layers);
	root = result.root;
	layers = result.layers;

	if (time) {
		console.info("\n");
		console.timeEnd("Parse dom");
	}

	return { "layers": layers };
}
