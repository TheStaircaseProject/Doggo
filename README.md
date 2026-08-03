# Doggo
A secondary engine for Storyline 360 that streamlines tile-based movement in SCORM-compliant learning experiences in order to make them more game-like.

## Features

- Orthogonal grid-based movement
- Top-down 2D
- Easy map import template
- Working exit/transition system between maps
- A collision layer
- Container/pickup interactions
- NPC textbox
- Elevation-dependent collision maps


## Screenshots
<img src="./img/readme/lava example.gif" alt="An animated dog moving around an illustrated cave">


## What This Isn't

This is not a broader game engine. There's no support for 3D, currently no support for depth maps, sparse sprite management, and no physics engine.


## Authors

- [@thestaircaseproject](https://www.github.com/thestaircaseproject)


## Acknowledgements

 - [Cave/lava tileset from Art by Mr. Beast.](https://opengameart.org/content/cave-tileset-0)


## Requirements

Updating the necessary files requires administrator access. Learning designers and developers using corporate computers may find administrative roadblocks to updating these files and should confirm an update is possible before trying to set this up.


## Doggo Setup

How to actually use Doggo — where the .js file goes, how to reference it in story.html, what the per-slide trigger needs to look like, and how loadMap() gets called.


### Download
Have a look over in the [JavaScript folder](https://github.com/TheStaircaseProject/Doggo/tree/main/.js). At the time of writing, there's only one differentiated version and it's not hosted anywhere else.

Right-click the doggo1.js file and Save As to your local desktop.


### Where to Put the .js File

When Storyline publishes your eLearning content, it uses templates of CSS, JS, and HTML. Those templates can be modified.

The JavaScript files your Storyline uses are separated by the kind of player you publish content in: classic or unified/modern. My install path for these templates is 
    ```C:\Program Files\Articulate\360\Storyline 64-bit\player\unified\html5\lib\scripts\```

Any scripts in there will automatically be added to your published output.


### Editing the HTML template

Your course's index.html file will still need to know to make the script available, so navigate back up the Explorer hierarchy to 
    ```C:\Program Files\Articulate\360\Storyline 64-bit\player\unified\```

In that folder, you'll see an index.html. Open it in your editor of course, e.g., Visual Studio Code. To streamline the update, Run as Administrator.

In the ```<head>``` of the index.html, add ```<script src="html5/lib/scripts/doggo1.js"></script>```, or whatever version of the script you've downloaded.


### Creating a bridge in Storyline

While a lot of JavaScript will run out a script file like we've attached, Doggo need some extra help accessing Storyline's object(), setVar(), and getVar() player functions.

While in your Storyline project, open the Master Slide for one of the slides you intend to add a map to. Create an Execute JavaScript trigger that runs when the timeline starts on the slide.

Have it run:
```window.object = object;```

```window.getVar = getVar;```

```window.setVar = setVar;```

That more or less "globalizes" the player functions, enabling any script of ours to interface with Storyline easily.


## Doggo Maps

### Doggo Map Creation

### Examples

window.dogg0 = {
  "metadata": {
    "id": "dogg0",
    "avatarObjectId": "6bV7cq6jk6T",
    "name": "Cemetery - Ruin",
    "tileSize": 60,
    "width": 20,
    "height": 12
  },
  "layers": {
    "groundLevels": {
	 	"0": [
	      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	      [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
	      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 8, 0, 0],
	      [1, 0, 0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 1],
	      [1, 0, 0, 0, 0, 0, 6, 1, 1, 1, 1, 1, 8, 0, 0, 0, 0, 0, 0, 1],
	      [1, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0, 1, 8, 0, 0, 0, 0, 0, 0, 1],
	      [1, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0, 1, 8, 0, 0, 0, 0, 0, 0, 1],
	      [1, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0, 1, 8, 0, 0, 0, 0, 0, 0, 1],
	      [1, 0, 0, 0, 0, 0, 6, 1, 1, 1, 1, 1, 8, 0, 0, 0, 0, 0, 0, 1],
	      [1, 8, 8, 6, 6, 6, 6, 8, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 1],
	      [0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	      [0, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	    ],
    },
    "objects": [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  "tileProperties": {
    "0": {"name": "empty", "walkable": true},
    "1": {"name": "wall", "walkable": false},
    "2": {"name": "stone", "walkable": true},
    "3": {"name": "water-left", "walkable": false},
    "4": {"name": "water", "walkable": false},
    "5": {"name": "granite", "walkable": true},
    "6": {"name": "dirt", "walkable": true},
    "7": {"name": "leaves", "walkable": true},
    "8": {"name": "pebbles", "walkable": true},
    "9": {"name": "floor_wood", "walkable": true}
  },
  "interactions": {
  	"1": {"type": "npc", "blocksMovement": true, "message": "<i>Smells like happy bugs."},
  	"2": {"type": "npc", "blocksMovement": true, "message": "<i>Smells like angel deodorant."},
  	"3": {
        "type": "npc",
        "speaker": "Bird",
        "message": ["Chirp chirp?"],
        "choices": [
            {"text": "[watch]", "goto": "birdStays"}, // Omitting a goto falls to endDialogue()
            {"text": "[bark]", "goto": "scaredBird"}
        ]
    }
  },
  "spawn": {"x": 1, "y": 6, "facing": "right"},
  "exits": [
    {"x": 20, "y": 2, "leadsTo": "dogg03", "spawnAt": {"x": 0, "y": 2}, "spawnFacing":"right"},
	{"x": 0, "y": 12, "leadsTo": "dogg01", "spawnAt": {"x": 0, "y": 0}, "spawnFacing":"down"},
	{"x": 1, "y": 12, "leadsTo": "dogg01", "spawnAt": {"x": 1, "y": 0}, "spawnFacing":"down"}
  ]
};

window.GameEngine.loadMap(dogg02);


## Feedback

If you have any feedback, please reach out to me at doggo.go.engine@gmail.com.


## FAQ

#### Question 1

TBD

## License
TBD
