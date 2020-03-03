declare interface SvgNode extends DefaultShapeMixin, ConstraintMixin {
	type: "SVG";
	svg: string;
}

declare type WithRef<T> = Partial<T> & { ref?: Element | Node };
declare type LayerNode = WithRef<RectangleNode | TextNode | FrameNode | SvgNode>;

declare interface Unit {
	unit: "PIXELS";
	value: number;
}

declare interface ParsedBoxShadow {
	inset: boolean;
	offsetX: number;
	offsetY: number;
	blurRadius: number;
	spreadRadius: number;
	color: string;
}
