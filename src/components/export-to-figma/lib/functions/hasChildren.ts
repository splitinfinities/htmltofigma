
export const hasChildren = (node: LayerNode): node is ChildrenMixin => node && Array.isArray((node as ChildrenMixin).children);
