// ============================================
// ENGINE BOOTSTRAP
// ============================================
if (!window.__mapEngineBooted) {
  window.__mapEngineBooted = true;

  // ======================
  // Event Listeners
  // ======================
  document.addEventListener('click', (e) => {
    if (!getVar('debugGrid') || !s.mapData) return;
    window.GameEngine.teleportToClick(e.clientX, e.clientY);
  });

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': window.GameEngine.move('up'); break;
      case 'ArrowDown': case 's': case 'S': window.GameEngine.move('down'); break;
      case 'ArrowLeft': case 'a': case 'A': window.GameEngine.move('left'); break;
      case 'ArrowRight': case 'd': case 'D': window.GameEngine.move('right'); break;
    }
  });




  window.GameEngine = {
    state: {
      mapData: null,
      currentGridX: 0,
      currentGridY: 0,
      elevation: 0,
      elevationByMap: { "dogg01": 0, "dogg02": 0, "dogg03": 0, "dogg04": 0, "dogg05": 0 },
      isMoving: false,
      tileSize: 60,
      canMove: false,
      mode: 'explore', // 'explore' | 'dialogue' | 'locked' 
      dialogueQueue: [],
      dialogueIndex: 0
    },
    directions: {
      up: {x:0,y:-1}, down: {x:0,y:1}, left: {x:-1,y:0}, right: {x:1,y:0},
      upleft: {x:-1,y:-1}, upright: {x:1,y:-1}, downleft: {x:-1,y:1}, downright: {x:1,y:1}
    }
  };

  const s = window.GameEngine.state;

  // ======================
  // Game Engine methods and functions
  // ======================
  window.GameEngine.teleportToClick = function(clientX, clientY) {
    const stageEl = document.querySelector('#slide, .slide-container' /* placeholder — see note below */);
    if (!stageEl) { console.log('Stage element not found'); return; }

    const rect = stageEl.getBoundingClientRect();
    const scaleX = rect.width / s.mapData.metadata.width / s.tileSize;
    const scaleY = rect.height / s.mapData.metadata.height / s.tileSize;

    const localX = (clientX - rect.left) / scaleX;
    const localY = (clientY - rect.top) / scaleY;

    const gridX = Math.floor(localX / s.tileSize);
    const gridY = Math.floor(localY / s.tileSize);

    window.GameEngine.teleport(gridX, gridY);
  };
  
  window.GameEngine.teleport = function(gridX, gridY) {
    if (gridX < 0 || gridX >= s.mapData.metadata.width ||
        gridY < 0 || gridY >= s.mapData.metadata.height) {
      console.log(`Out of bounds: (${gridX}, ${gridY})`);
      return;
    }

    const avatar = currentAvatar();
    s.currentGridX = gridX;
    s.currentGridY = gridY;
    avatar.x = gridX * s.tileSize;
    avatar.y = gridY * s.tileSize;
    setVar('avatarX', gridX);
    setVar('avatarY', gridY);
    console.log(`Teleported to (${gridX}, ${gridY})`);
  };

  window.GameEngine.loadMap = function(mapData) {
    s.mapData = mapData;
    s.tileSize = mapData.metadata.tileSize || 60;
    s.elevation = s.elevationByMap[mapData.metadata.id] ?? 0;
    console.log(s.mapData);
    s.isMoving = false;
    spawnAvatar();
    applyElevationDepths();
  };


  window.GameEngine.move = function(direction) {
    if (s.isMoving || !s.mapData) return;

    switch (s.mode) {
      case 'dialogue':
        window.GameEngine.advanceDialogue();  
        // setVar('advanceSpeech', true);
        // setVar('advanceSpeech', false);
        return;
      case 'locked':
        return; // input fully ignored — cutscenes, forced pauses, etc.
      case 'explore':
        break; // fall through to normal movement below
      default:
        return;
    }
    const dir = window.GameEngine.directions[direction];
    if (!dir) return;

    const avatar = currentAvatar();
    avatar.state = `walk_${direction}`;

    const newGridX = s.currentGridX + dir.x;
    const newGridY = s.currentGridY + dir.y;

    if (checkExit(newGridX, newGridY)) return;
    if (checkElevationLink(newGridX, newGridY, direction)) return;


    if (newGridX < 0 || newGridX >= s.mapData.metadata.width ||
        newGridY < 0 || newGridY >= s.mapData.metadata.height) {
      return;
    }

    if (handleObjectInteraction(newGridX, newGridY)) return;
    if (checkCollision(newGridX, newGridY)) return;

    glideAvatarTo(newGridX, newGridY, direction);

  };

  // Advances the text in the dialogue layer.
  window.GameEngine.advanceDialogue = function() {
    s.dialogueIndex++;

    if (s.dialogueIndex < s.dialogueQueue.length) {
      // More lines left — swap text in place, box stays open, timeline stays paused
      showCurrentLine();
    } else {
      // Last line was just cleared — this is the real "close" signal
      setVar('advanceSpeech', true);
    }
  };

  window.GameEngine.endDialogue = function() {
    // Called by Storyline at the very end of the layer's closing timeline, once the layer is fully hidden
    setVar('npcSpeaks', false);
    setVar('advanceSpeech', false);
    s.mode = 'explore';
    s.dialogueQueue = [];
    s.dialogueIndex = 0;
  };


  // =======================
  // Helper functions
  // =======================
  function currentAvatar() {
    return object(s.mapData.metadata.avatarObjectId);
  }

  function spawnAvatar() {
    const avatar = currentAvatar();
    const spawnX = getVar('SpawnX');
    const spawnY = getVar('SpawnY');
    const spawnFacing = getVar('SpawnFacing');

    if (spawnX !== undefined && spawnY !== undefined && spawnX !== null) {
      s.currentGridX = spawnX;
      s.currentGridY = spawnY;
      setVar('SpawnX', null);
      setVar('SpawnY', null);
    } else {
      s.currentGridX = s.mapData.spawn.x;
      s.currentGridY = s.mapData.spawn.y;
    }

    avatar.x = s.currentGridX * s.tileSize;
    avatar.y = s.currentGridY * s.tileSize;
    console.log(`Dog at (${avatar.x},${avatar.y})`);
    if (spawnFacing) {
    	avatar.state = `idle_${spawnFacing}`;
    } else if (s.mapData.spawn.facing) {
	    avatar.state = `idle_${s.mapData.spawn.facing}`;
    }
    // avatar.depth = 100;
    
    s.canMove = true;
    setVar('TriggerMapTransition', false);
  }

  function applyElevationDepths() {
    const depths = s.mapData.metadata.elevationDepths?.[s.elevation];
    if (!depths) return;

    currentAvatar().depth = depths.avatar;

    const objIds = s.mapData.metadata.elevationObjectIds || {};
    Object.keys(objIds).forEach(key => {
      if (depths[key] !== undefined) {
        object(objIds[key]).depth = depths[key];
      }
      console.log('Elevation changed.');
    });
  }

  function checkCollision(gridX, gridY) {
    const groundTileID = s.mapData.layers.groundLevels[s.elevation][gridY][gridX];
    const groundProps = s.mapData.tileProperties[groundTileID];
    return !groundProps.walkable;
  }

  function checkElevationLink(gridX, gridY, direction) {
    const link = s.mapData.elevationLinks?.find(l => l.x === gridX && l.y === gridY);
    if (!link) return false;
    if (link.approachFrom && link.approachFrom !== direction) return false;

    s.elevation = link.toElevation;
    s.elevationByMap[s.mapData.metadata.id] = link.toElevation; // remember it
    
    glideAvatarTo(link.toX, link.toY, direction);
    applyElevationDepths();
    return true;
  }

  function checkExit(gridX, gridY) {
    const exit = s.mapData.exits.find(e => e.x === gridX && e.y === gridY);
    console.log(`Checking exit at (${gridX},${gridY})`);
    if (exit) {
      // Wrong side of the doorway — treat as a no-op or bump
      if (exit.approachFrom && exit.approachFrom !== direction) { return; }
    	transitionToMap(exit); 
    	return true; 
	}
    return false;
  }

  function glideAvatarTo(newGridX, newGridY, direction) {
    const avatar = currentAvatar();
    const newX = newGridX * s.tileSize;
    const newY = newGridY * s.tileSize;

    s.isMoving = true;
    s.currentGridX = newGridX;
    s.currentGridY = newGridY;
    setVar('avatarX', newGridX);
    setVar('avatarY', newGridY);

    const startX = avatar.x, startY = avatar.y;
    const startTime = performance.now();
    const duration = 100;

    function animate(t) {
      const progress = Math.min((t - startTime) / duration, 1);
      const eased = Math.max(1 - Math.pow(1 - progress, 3), 0);
      avatar.x = startX + (newX - startX) * eased;
      avatar.y = startY + (newY - startY) * eased;
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        avatar.x = newX; avatar.y = newY;
        s.isMoving = false;
        avatar.state = `idle_${direction}`;
      }
    }
    requestAnimationFrame(animate);
  }

  function handleObjectInteraction(gridX, gridY) {
    const objectTileID = s.mapData.layers.objects[gridY][gridX];
    if (objectTileID === 0) return false;
    
    const interaction = s.mapData.interactions[objectTileID];
    if (!interaction) return false;
    
    handleInteraction(interaction, gridX, gridY);
    return !!interaction.blocksMovement; // container: true (stop) / pickup: false (continue)
  }

  function handleInteraction(interaction, gridX, gridY) {
    switch (interaction.type) {
      case 'container': openContainer(interaction, gridX, gridY); return true;
      case 'npc': talkToNPC(interaction); return true;
      case 'pickup': pickupItem(interaction, gridX, gridY); return true;
      default: return false;
    }
  }

  function openContainer(interaction, gridX, gridY) {
	interaction.contents.forEach(item => console.log(`Received: ${item}`));
	delete s.mapData.interactions[s.mapData.layers.objects[gridY][gridX]];
	s.mapData.layers.objects[gridY][gridX] = 0;
  }

  function pickupItem(interaction, gridX, gridY) {
    // Record possession
    setVar(`has${interaction.itemId}`, true);
    console.log(`Picked up: ${interaction.itemId}`);
    
    // if the pickup has its own Storyline object (icon on the tile), hide it
    if (interaction.objectId) {
      object(interaction.objectId).state = 'Hidden';
    }
    
    // Clear it from the map data so it can't be picked up twice
    delete s.mapData.interactions[s.mapData.layers.objects[gridY][gridX]];
    s.mapData.layers.objects[gridY][gridX] = 0;
  }

  function showCurrentLine() {
    setVar('npcMessage', s.dialogueQueue[s.dialogueIndex]);
    setVar('npcSpeaks', true);
  }

  function talkToNPC(interaction) {
    s.dialogueQueue = Array.isArray(interaction.message) ? interaction.message : [interaction.message];
    s.dialogueIndex = 0;
    s.mode = 'dialogue';
    showCurrentLine();
  }

  function transitionToMap(exit) {    
    setVar('NextMap', exit.leadsTo);
    setVar('SpawnX', exit.spawnAt.x);
    setVar('SpawnY', exit.spawnAt.y);
    setVar('SpawnFacing', exit.spawnFacing);
    setVar('CurrentMap', exit.leadsTo);
    setVar('TriggerMapTransition', true);
  }
}

