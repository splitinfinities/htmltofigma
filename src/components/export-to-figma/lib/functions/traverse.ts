import { hasChildren } from "./hasChildren";

export const traverse = (layer: LayerNode, cb: (layer: LayerNode, parent?: LayerNode | null) => void, parent?: LayerNode | null) => {
	if (layer) {
		cb(layer, parent);
		if (hasChildren(layer)) {
			layer.children.forEach(child =>
				traverse(child as LayerNode, cb, layer)
			);
		}
	}
}
