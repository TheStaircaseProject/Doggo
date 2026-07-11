// ============================================
// ENGINE BOOTSTRAP
// ============================================
if (!window.__mapEngineBooted) {
  window.__mapEngineBooted = true;

  window.GameEngine = {
    state: {
      mapData: null,
      currentGridX: 0,
      currentGridY: 0,
      isMoving: false,
      tileSize: 60,
      canMove: false
    },
    directions: {
      up: {x:0,y:-1}, down: {x:0,y:1}, left: {x:-1,y:0}, right: {x:1,y:0},
      upleft: {x:-1,y:-1}, upright: {x:1,y:-1}, downleft: {x:-1,y:1}, downright: {x:1,y:1}
    }
  };

  const s = window.GameEngine.state;

  window.GameEngine.loadMap = function(mapData) {
    s.mapData = mapData;
    s.tileSize = mapData.metadata.tileSize || 60;
    s.isMoving = false;
    spawnAvatar();
  };

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

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': window.GameEngine.move('up'); break;
      case 'ArrowDown': case 's': case 'S': window.GameEngine.move('down'); break;
      case 'ArrowLeft': case 'a': case 'A': window.GameEngine.move('left'); break;
      case 'ArrowRight': case 'd': case 'D': window.GameEngine.move('right'); break;
    }
  });

  window.GameEngine.move = function(direction) {
    if (s.isMoving || !s.mapData) return;
    console.log(`Can move? ${s.canMove}`);
    if (!s.canMove) {
    	setVar('advanceSpeech', true);
    	return;
    }
    const dir = window.GameEngine.directions[direction];
    if (!dir) return;

    const avatar = currentAvatar();
    avatar.state = `walk_${direction}`;

    const newGridX = s.currentGridX + dir.x;
    const newGridY = s.currentGridY + dir.y;

    if (checkExit(newGridX, newGridY)) return;

    if (newGridX < 0 || newGridX >= s.mapData.metadata.width ||
        newGridY < 0 || newGridY >= s.mapData.metadata.height) {
      return;
    }

    if (handleObjectInteraction(newGridX, newGridY)) return;
    if (checkCollision(newGridX, newGridY)) return;

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
  };

  function checkCollision(gridX, gridY) {
    const groundTileID = s.mapData.layers.ground[gridY][gridX];
    const groundProps = s.mapData.tileProperties[groundTileID];
    return !groundProps.walkable;
  }

  function checkExit(gridX, gridY) {
    const exit = s.mapData.exits.find(e => e.x === gridX && e.y === gridY);
    console.log(`Checking exit at (${gridX},${gridY})`);
    if (exit) { 
    	transitionToMap(exit); 
    	return true; 
	}
    return false;
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
  
  function talkToNPC(interaction) {
  	setVar('npcMessage', interaction.message);
  	setVar('npcSpeaks', true);
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

  function transitionToMap(exit) {    
    setVar('NextMap', exit.leadsTo);
    setVar('SpawnX', exit.spawnAt.x);
    setVar('SpawnY', exit.spawnAt.y);
    setVar('SpawnFacing', exit.spawnFacing);
    setVar('CurrentMap', exit.leadsTo);
    setVar('TriggerMapTransition', true);
  }
}

