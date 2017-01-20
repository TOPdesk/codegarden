Welcome to CodeGarden®

# Story
The GNOMEs want to populate the world.
Trees spawn GNOMEbabies, so let's go and grow some trees!

Just so you know
- GNOMEs have epic beards
- GNOMEs are infinite

# Gameplay elements
In the first few levels, the purpose of a level is to make a tree or number of trees grow enough to produce GNOMEbabies.
You do this by giving the GNOME a program that tells them exactly what to do to to make the trees grow.
GNOMEs have a limited number of actions they can undertake and it's your job to ensure all trees grow with the limited number of actions you have.

GNOMEs will loop the set of actions they are given, allowing the player to define a program once and let the GNOME repeat it.
Each GNOME starts at a house and programs are bound to a house, so the player can create different programs for each house.
GNOMEs can and should interact with the environment and each other.

Later level will have other win conditions than simply growing trees. 

### GNOME Movement
A GNOME moves as a result of player input in the form of functions.
There are only four functions a player can use as input.  

- Move forward
    * This function moves the GNOME one tile in the direction it is facing
- Rotate clockwise
    * This function rotates the GNOME 90 degrees to the right while remaining on the same tile
- Rotate counter-clockwise
    * This function rotates the GNOME 90 degrees to the left while remaining on the same tile
- Take Action
    * This function makes the GNOME do an action, depending on the tiles surrounding it.

### Contextual GNOME Actions
The action executed by the GNOME depends on the tile it is facing and the state of the GNOME.
For example, if it is holding water while facing a tree, using the action function will make the GNOME water the tree.
#### Holding Nothing
This is the default state of a GNOME.
- When facing a tile with water, a GNOME holding nothing will take out its watering can and collect water
- When facing a tile with a tree, a GNOME holding nothing will hug the tree
- When facing a tile with a rock, a GNOME holding nothing will kick the rock 
- When facing a tile with holding an item that can be picked up, a GNOME holding nothing will pick up the item.
#### Holding water
A GNOME holding water has a watering can in its hands.
Using the action function will make the GNOME empty the can on the tile it is facing, losing the water.
#### Holding items
During the course of a level, it is possible that a GNOME picks up an item.
If the action function is used while the GNOME is holding an item, that GNOME will attempt to perform an item-specific action.
If the action fails, the item remains in the possession of the GNOME.
If the action succeeds, the item may be lost, transformed, or remain in the hands of the GNOME.

### Programming GNOME Actions
GNOMEs are controlled through programming.
A program consists of a fixed number of turns.
Each function takes up one turn.
Every GNOME in a level has its own program. 
A level requires the player to program GNOMEs in order to reach the win condition.
#### Action orders
GNOMEs act in a specific order each level. 
When the level is started, each GNOME executes its first action, until all GNOMEs have finished.
Then the first GNOME executes its second action and so on. 
#### End of program
If a GNOME's program is at its end, it is automatically returned to its house. 
This takes one turn.
After returning to the house, the GNOME starts its program from the beginning.    
#### Doing nothing
Not every turn in a program is required to be filled.
GNOMEs executing programs with empty turns will skip those turns dancing.

### GNOME death
A GNOME may die in several ways, but always as the result of a GNOME action.
A death animation takes one turn, after which a gnome is respawned at its original house.
So, in total, death costs a GNOME two turns. 


## Objects
There are many different objects to be found in the world of CodeGarden®.

### Houses
Each house houses a GNOME.
You can not walk through a tile with a house on it.

### Trees
Trees are of vital importance to GNOME reproduction as they spawn GNOMEbabies.
However, they can also be chopped down to provide *wood*, while a grown tree also is a source of *shade*.
Trees require water and sunlight to grow.
You can not walk through a tile with a tree on it.

### Rocks
Rocks may block your path.
You can not walk through a tile with a rock on it.

### Items
Items can be picked up. 
It *is* possible to walk through them as well.

## Tiles
Tiles represent the landscape of a level.
There are many different types of tiles, each with their own function.

### Grass
Grass tiles are fertile land.
Many different objects can grow on them and a GNOME can walk freely over an empty grass tile.

### Desert
Desert tiles contain very little water, meaning that only specific objects can grow on them.

### Water
Water tiles hold water. 
A GNOME can not walk over an empty water tile without drowning.
As any gardener will tell you, water is vital to a healthy CodeGarden®.



# BACKSTAGE INFO
Here be info not meant for the players


## Levels
Level design philosophy:
- Do not make popup-tutorials
- Do not underestimate your users
- Make things flow naturally
- From the very first level, all concepts are available if applicable.
For example, if we make it rain from the gnomes beards after they die, this should happen in the first level as well even if it's useless.
- See also: [this video](https://www.youtube.com/watch?v=8FpigqfcvlM)

### Level 0 - The start menu
- Here, we are going to introduce gnome movement.
The start menu is a T-intersection with three choices at its ends (quit, start, options).
The gnome starts in the center facing downward.
The menu options are shown with the programs required to move the gnome shown next to them.
Clicking one of the menu options actually starts that option, so the gnome will move to one of
the ends of the intersection.
Just for fun, players are allowed to edit the programs that have the gnome move to the correct place, potentially messing up their menu.

### Region 1
Region 1 is a desert. There will be a bit of water here, some rocks and a few trees, but not much else.

#### Level 1 - Growing trees 
Level one introduces the following concepts:
- Basic programming
- Watering a tree
- Obstacles

Level layout (D = desert, H = house, W = water, R = rock, T = tree):
```
DHDWD
DDDWD
DDRWW
DDDDT
```

Required program to win the level:  
[FFFLFFLARA]

### Level 2 - Multiple gnomes
Level two introduces the following concepts:
- Multiple gnomes
- Gnome clashing
- Fixed functions

Level layout (D = desert, H = house, W = water, T = tree):  
```
DDDWDD
WWWWDD
DWHWHT
DDDDDD
TDDDDD
```
Required programs to win the level:   
H1 [FLFLARFFLA] => this program is fixed and cannot be changed   
H2 [FFRFFFRFALFLA] => Note that starting out with [FRF] will cause both gnomes to end up on the same tile. This will cause a problem as they will be fighting (or something like that)

## Planned expansions

### Actions
woodchopping, bridge building, rock carrying, mating (between gnomes)  

### Objects
#### Tools
axes, gloves (for carrying rocks?),

### Tiles
salt water, fresh water, mud, swamp, ice (slide along), lava, puddle

### Programming concepts
boolean logic, looping, subroutines
Subroutines should be named and gnome-independent, i.e. able to be used by different gnomes.

### Other
- Death gnomes spawn clouds, 3 clouds make rain, rain waters the ground directly under where the gnome died.
This requires other ways to kill gnomes...
- Kicking certain rocks may move them one tile in the kick direction, depending on the gnome
- Upgrading gnomes to other types (Strong gnome, fast gnome, ...) with certain "abilities". 
For example, fast gnomes move multiple tiles and strong gnomes can move certain objects. 
- Moving obstacles
- Have an overview with the different gnomes and the actions they are going to perform.
Also allow naming your gnomes there ("tree-waterer", "lumberjack", ...)- 
