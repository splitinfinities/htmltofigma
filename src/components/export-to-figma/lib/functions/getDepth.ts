import { getParents } from "./getParents";

export const getDepth = (node: Element | Node) => {
	return getParents(node).length;
}
