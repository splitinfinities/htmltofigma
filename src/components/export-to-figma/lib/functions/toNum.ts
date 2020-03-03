export const toNum = (v: string): number => {
	// if (!/px$/.test(v) && v !== '0') return v;
	if (!/px$/.test(v) && v !== "0") return 0;
	const n = parseFloat(v);
	// return !isNaN(n) ? n : v;
	return !isNaN(n) ? n : 0;
};