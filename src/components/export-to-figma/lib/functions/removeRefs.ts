import { traverse } from "./traverse";

export const removeRefs = (root, layers: LayerNode[]) => {
	layers.concat([root]).forEach(layer => {
		traverse(layer, child => {
			delete child.ref;
		});
	});

	return { root, layers };
}