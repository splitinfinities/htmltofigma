const LENGTH_REG = /^[0-9]+[a-zA-Z%]+?$/;

export const isLength = (v: string) => v === "0" || LENGTH_REG.test(v);
