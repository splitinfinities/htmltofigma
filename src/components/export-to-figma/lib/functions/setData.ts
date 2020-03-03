export const setData = (node: any, key: string, value: string) => {
	if (!(node as any).data) {
		(node as any).data = {};
	}
	(node as any).data[key] = value;
}