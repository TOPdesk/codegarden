/// <reference path="coordinates.ts"/>

namespace WorldConstants {
	export const SPRITE_SHEET = "sprites";

	export const BLOCK_WIDTH = 110;
	export const BLOCK_HEIGHT = 68;
	export const FAST_TURN_LENGTH = 200;
	export const SLOW_TURN_LENGTH = 500;

	export const MINIMUM_GAME_WIDTH = 1024; //Minimum supported width.

	export const COORDINATE_TRANSFORMER: CoordinateTransformer = new CoordinateTransformer(BLOCK_WIDTH, BLOCK_HEIGHT);

	export enum BlockType {
		GRASS,
		WATER,
		DESERT,
		STONE,
		SWAMP
	}
}
