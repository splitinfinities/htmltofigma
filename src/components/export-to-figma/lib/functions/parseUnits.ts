export const parseUnits = (str?: string | null): null | Unit => {
	if (!str) {
		return null;
	}
	const match = str.match(/([\d\.]+)px/);
	const val = match && match[1];
	if (val) {
		return {
			unit: "PIXELS",
			value: parseFloat(val)
		};
	}
	return null;
};