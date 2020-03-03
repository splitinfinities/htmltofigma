import { traverse } from "./traverse";

export const getParent = (root, layer: LayerNode) => {
	let response: LayerNode | null = null;
	try {
		traverse(root, child => {
			if (
				child &&
				(child as any).children &&
				(child as any).children.includes(layer)
			) {
				response = child;
				// Deep traverse short circuit hack
				throw "DONE";
			}
		});
	} catch (err) {
		if (err === "DONE") {
			// Do nothing
		} else {
			console.error(err.message);
		}
	}
	return response;
}