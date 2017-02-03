/// <reference path="coordinates.ts"/>

namespace WorldConstants {
	export const BLOCK_WIDTH = 110;
	export const BLOCK_HEIGHT = 68;
	export const TURN_LENGTH_IN_MILLIS = 200;

	export const COORDINATE_TRANSFORMER: CoordinateTransformer = new CoordinateTransformer(BLOCK_WIDTH, BLOCK_HEIGHT);

	export enum BlockType {
		GRASS,
		WATER,
		DESERT,
		STONE
	}
}
