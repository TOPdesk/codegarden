/// <reference path="coordinates.ts"/>

namespace WorldConstants {
	export const BLOCK_WIDTH: number = 110;
	export const BLOCK_HEIGHT: number = 68;
	export const WORLD_ORIGIN_X: number = 300;
	export const WORLD_ORIGIN_Y: number = 100;

	export const COORDINATE_TRANSFORMER: CoordinateTransformer = new CoordinateTransformer(BLOCK_WIDTH, BLOCK_HEIGHT);
}
