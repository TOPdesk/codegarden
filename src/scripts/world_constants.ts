/// <reference path="coordinates.ts"/>

namespace WorldConstants {
	export const BLOCK_WIDTH: number = 110;
	export const BLOCK_HEIGHT: number = 68;

	export const COORDINATE_TRANSFORMER: CoordinateTransformer = new CoordinateTransformer(BLOCK_WIDTH, BLOCK_HEIGHT);

	export enum BlockType {
		GRASS,
		WATER,
		DESERT,
		STONE
	}
}
