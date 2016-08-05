/// <reference path="../scripts/gnome.ts" />
/// <reference path="../libs/dt-jasmine/jasmine.d.ts" />

describe("Rotating left", () => {
    let gnome: Gnome;

    beforeAll(() => {
        gnome = new Gnome(new Phaser.Game(), 0, 0);
    });
    it("initializes with SE", () => {
        expect(gnome.direction).toBe(Direction.SE);
    });
    it("faces NE when turning left", () => {
        gnome.rotateLeft();
        expect(gnome.direction).toBe(Direction.NE);
    });
    it("faces NW when turning left again", () => {
        gnome.rotateLeft();
        expect(gnome.direction).toBe(Direction.NW);
    });
    it("faces SW when turning left again", () => {
        gnome.rotateLeft();
        expect(gnome.direction).toBe(Direction.SW);
    });
    it("faces back SE when turning left again", () => {
        gnome.rotateLeft();
        expect(gnome.direction).toBe(Direction.SE);
    });      
});

describe("Rotating right", () => {
    let gnome: Gnome;

    beforeAll(() => {
        gnome = new Gnome(new Phaser.Game(), 0, 0);
    });    
    it("faces SW when turning right", () => {
        gnome.rotateRight();
        expect(gnome.direction).toBe(Direction.SW);
    });
    it("faces NW when turning right again", () => {
        gnome.rotateRight();
        expect(gnome.direction).toBe(Direction.NW);
    });
    it("faces NE when turning right again", () => {
        gnome.rotateRight();
        expect(gnome.direction).toBe(Direction.NE);
    });
    it("faces back SE when turning right again", () => {
        gnome.rotateRight();
        expect(gnome.direction).toBe(Direction.SE);
    }); 
});

// describe("Setting fields", () => {
// });

// describe("Gnome dies", () => {
// });