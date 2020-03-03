import { defaults } from "./defaults";

export const pick = (object: any, paths: any[], color) => {
	const newObject: any = {};

	paths.forEach(path => {
		if (object[path]) {
			if (object[path] !== defaults(color)[path]) {
				newObject[path] = object[path];
			}
		}
	});

	return newObject;
}