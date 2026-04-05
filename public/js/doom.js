// ============================================================
// DOOM 95 — Raycaster FPS for WWWhippet!95
// ============================================================

const DOOM_W = 320;
const DOOM_H = 200;
const DOOM_VIEW_H = 160; // 3D viewport height (bottom 40px = HUD)
const DOOM_TEX = 64;     // Texture size

const DOOM_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,2,2,2,0,0,0,3,3,3,0,0,0,1],
  [1,0,0,2,0,0,0,0,0,0,0,3,0,0,0,1],
  [1,0,0,2,0,0,0,0,0,0,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,4,4,4,4,0,0,0,0,0,1],
  [1,0,0,0,0,0,4,0,0,4,0,0,0,0,0,1],
  [1,0,0,0,0,0,4,0,0,4,0,0,0,0,0,1],
  [1,0,0,3,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,3,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,3,3,3,0,0,0,2,2,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const DoomGame = {
  canvas: null,
  ctx: null,
  imageData: null,
  buf: null,
  winState: null,
  animFrame: null,
  running: false,
  lastTime: 0,
  textures: [],
  zBuffer: new Float64Array(DOOM_W),

  // Player
  player: { x: 2.5, y: 2.5, angle: 0, health: 100, ammo: 50, score: 0 },
  planeX: 0, planeY: 0.66,
  keys: {},
  moveSpeed: 3.0,
  rotSpeed: 2.5,

  // Enemies
  enemies: [],

  // Weapon
  weapon: { firing: false, timer: 0, frame: 0 },
  walkTimer: 0,

  // Bound handlers
  _onKeyDown: null,
  _onKeyUp: null,
  _onMouseDown: null,

  open() {
    if (this.winState && document.contains(this.winState.el)) {
      WindowManager.focusWindow(this.winState.id);
      return;
    }

    const html = `<div style="background:#000;display:flex;align-items:center;justify-content:center;height:100%;overflow:hidden;">
      <canvas class="doom-canvas" width="${DOOM_W}" height="${DOOM_H}"
        style="width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;"></canvas>
    </div>`;

    this.winState = WindowManager.createGenericWindow('DOOM 95', html, {
      icon: '&#128128;',
      width: '420px',
      height: '340px',
    });

    const body = this.winState.el.querySelector('.generic-window-body');
    if (body) { body.style.padding = '0'; body.style.overflow = 'hidden'; }

    this.canvas = this.winState.el.querySelector('.doom-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.imageData = this.ctx.createImageData(DOOM_W, DOOM_H);
    this.buf = this.imageData.data;

    this.winState.onClose = () => this.close();

    this.generateTextures();
    this.initLevel();
    this.bindInput();
    this.running = true;
    this.lastTime = performance.now();
    this.animFrame = requestAnimationFrame((t) => this.gameLoop(t));
  },

  close() {
    this.running = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.unbindInput();
    this.winState = null;
  },

  // ---- Texture Generation ----
  generateTextures() {
    this.textures = [];
    for (let t = 0; t < 4; t++) {
      const tex = new Uint8Array(DOOM_TEX * DOOM_TEX * 3);
      for (let y = 0; y < DOOM_TEX; y++) {
        for (let x = 0; x < DOOM_TEX; x++) {
          const i = (y * DOOM_TEX + x) * 3;
          if (t === 0) {
            // Grey stone with mortar lines
            const base = 80 + Math.random() * 60 | 0;
            const mortar = (y % 16 < 1 || x % 32 < 1) ? -30 : 0;
            const v = Math.max(40, base + mortar);
            tex[i] = v; tex[i+1] = v; tex[i+2] = v;
          } else if (t === 1) {
            // Red brick
            const row = Math.floor(y / 8);
            const off = (row % 2) * 16;
            const bx = (x + off) % 32;
            const isMortar = (y % 8 < 1) || (bx < 1);
            if (isMortar) {
              tex[i] = 120; tex[i+1] = 110; tex[i+2] = 90;
            } else {
              const v = 140 + Math.random() * 40 | 0;
              tex[i] = v; tex[i+1] = 40 + Math.random() * 20 | 0; tex[i+2] = 30;
            }
          } else if (t === 2) {
            // Blue tech panel
            const grid = (x % 16 < 1 || y % 16 < 1);
            const center = x > 20 && x < 44 && y > 20 && y < 44;
            if (grid) {
              tex[i] = 100; tex[i+1] = 140; tex[i+2] = 200;
            } else if (center) {
              tex[i] = 60; tex[i+1] = 80; tex[i+2] = 160;
            } else {
              tex[i] = 30; tex[i+1] = 50; tex[i+2] = 120 + Math.random() * 20 | 0;
            }
          } else {
            // Wood
            const grain = Math.sin(x * 0.5 + Math.sin(y * 0.1) * 3) * 20;
            const base = 100 + grain;
            tex[i] = base + 30; tex[i+1] = base; tex[i+2] = base - 30;
          }
        }
      }
      this.textures.push(tex);
    }
  },

  // ---- Level Init ----
  initLevel() {
    this.player = { x: 2.5, y: 2.5, angle: 0, health: 100, ammo: 50, score: 0 };
    this.updatePlane();
    this.enemies = [
      { x: 4.5, y: 4.5, health: 3, alive: true, state: 'idle', attackTimer: 0, hurtTimer: 0 },
      { x: 10.5, y: 4.5, health: 3, alive: true, state: 'idle', attackTimer: 0, hurtTimer: 0 },
      { x: 7.5, y: 8.5, health: 4, alive: true, state: 'idle', attackTimer: 0, hurtTimer: 0 },
      { x: 4.5, y: 11.5, health: 3, alive: true, state: 'idle', attackTimer: 0, hurtTimer: 0 },
      { x: 10.5, y: 11.5, health: 3, alive: true, state: 'idle', attackTimer: 0, hurtTimer: 0 },
      { x: 13.5, y: 13.5, health: 5, alive: true, state: 'idle', attackTimer: 0, hurtTimer: 0 },
    ];
    this.weapon = { firing: false, timer: 0, frame: 0 };
    this.keys = {};
    this.walkTimer = 0;
  },

  updatePlane() {
    const a = this.player.angle;
    this.dirX = Math.cos(a);
    this.dirY = Math.sin(a);
    this.planeX = -Math.sin(a) * 0.66;
    this.planeY = Math.cos(a) * 0.66;
  },

  // ---- Game Loop ----
  gameLoop(timestamp) {
    if (!this.running) return;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();
    this.ctx.putImageData(this.imageData, 0, 0);

    // Draw text HUD on top using canvas API (faster than pixel text)
    this.renderHUDText();

    this.animFrame = requestAnimationFrame((t) => this.gameLoop(t));
  },

  // ---- Update ----
  update(dt) {
    const p = this.player;
    const speed = this.moveSpeed * dt;
    const rot = this.rotSpeed * dt;
    let moving = false;

    if (p.health <= 0) return;

    // Rotation
    if (this.keys['ArrowLeft'] || this.keys['a']) { p.angle -= rot; this.updatePlane(); }
    if (this.keys['ArrowRight'] || this.keys['d']) { p.angle += rot; this.updatePlane(); }

    // Movement
    const forward = (this.keys['ArrowUp'] || this.keys['w']) ? 1 : 0;
    const back = (this.keys['ArrowDown'] || this.keys['s']) ? 1 : 0;
    const move = forward - back;

    if (move !== 0) {
      moving = true;
      const mx = Math.cos(p.angle) * speed * move;
      const my = Math.sin(p.angle) * speed * move;
      const margin = 0.2;
      const signX = mx > 0 ? margin : -margin;
      const signY = my > 0 ? margin : -margin;
      if (DOOM_MAP[Math.floor(p.y)][Math.floor(p.x + mx + signX)] === 0) p.x += mx;
      if (DOOM_MAP[Math.floor(p.y + my + signY)][Math.floor(p.x)] === 0) p.y += my;
    }

    // Walk bob
    if (moving) this.walkTimer += dt * 8;

    // Weapon
    if (this.weapon.firing) {
      this.weapon.timer += dt;
      if (this.weapon.timer > 0.08) {
        this.weapon.timer = 0;
        this.weapon.frame++;
        if (this.weapon.frame > 2) {
          this.weapon.firing = false;
          this.weapon.frame = 0;
        }
      }
    }

    // Enemies
    this.updateEnemies(dt);
  },

  // ---- Enemy AI ----
  updateEnemies(dt) {
    const p = this.player;
    if (p.health <= 0) return;

    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.hurtTimer > 0) e.hurtTimer -= dt;

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (e.state === 'idle') {
        if (dist < 8 && this.hasLineOfSight(e.x, e.y, p.x, p.y)) {
          e.state = 'chase';
        }
      }

      if (e.state === 'chase') {
        // Move toward player
        if (dist > 1.2) {
          const spd = 1.5 * dt;
          const nx = e.x + (dx / dist) * spd;
          const ny = e.y + (dy / dist) * spd;
          if (DOOM_MAP[Math.floor(e.y)][Math.floor(nx)] === 0) e.x = nx;
          if (DOOM_MAP[Math.floor(ny)][Math.floor(e.x)] === 0) e.y = ny;
        }

        // Attack
        if (dist < 1.5) {
          e.attackTimer += dt;
          if (e.attackTimer > 1.0) {
            e.attackTimer = 0;
            p.health -= 5 + Math.random() * 5 | 0;
            if (p.health < 0) p.health = 0;
          }
        }
      }
    }
  },

  hasLineOfSight(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(dist * 4);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const mx = Math.floor(x0 + dx * t);
      const my = Math.floor(y0 + dy * t);
      if (DOOM_MAP[my] && DOOM_MAP[my][mx] !== 0) return false;
    }
    return true;
  },

  // ---- Shooting ----
  shoot() {
    const p = this.player;
    if (p.health <= 0 || p.ammo <= 0 || this.weapon.firing) return;
    this.weapon.firing = true;
    this.weapon.frame = 1;
    this.weapon.timer = 0;
    p.ammo--;

    // Find closest enemy near crosshair
    let bestDist = 10;
    let bestEnemy = null;

    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Angle to enemy
      const angleToEnemy = Math.atan2(dy, dx);
      let angleDiff = angleToEnemy - p.angle;
      // Normalize to [-PI, PI]
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      if (Math.abs(angleDiff) < 0.1 && dist < bestDist) {
        if (this.hasLineOfSight(p.x, p.y, e.x, e.y)) {
          bestDist = dist;
          bestEnemy = e;
        }
      }
    }

    if (bestEnemy) {
      bestEnemy.health--;
      bestEnemy.hurtTimer = 0.2;
      if (bestEnemy.health <= 0) {
        bestEnemy.alive = false;
        p.score += 100;
      }
    }
  },

  // ---- Rendering ----
  render() {
    const buf = this.buf;
    const p = this.player;

    // Floor and ceiling
    for (let y = 0; y < DOOM_VIEW_H; y++) {
      for (let x = 0; x < DOOM_W; x++) {
        const i = (y * DOOM_W + x) * 4;
        if (y < DOOM_VIEW_H / 2) {
          // Ceiling - dark grey gradient
          const v = 40 + (y / DOOM_VIEW_H) * 30 | 0;
          buf[i] = v; buf[i+1] = v; buf[i+2] = v + 10; buf[i+3] = 255;
        } else {
          // Floor - dark brown gradient
          const v = 30 + ((DOOM_VIEW_H - y) / DOOM_VIEW_H) * 40 | 0;
          buf[i] = v + 15; buf[i+1] = v; buf[i+2] = v - 10; buf[i+3] = 255;
        }
      }
    }

    // Raycast walls
    this.castRays();

    // Sprites (enemies)
    this.renderSprites();

    // Weapon
    this.renderWeapon();

    // HUD bar
    this.renderHUD();
  },

  // ---- Raycasting ----
  castRays() {
    const p = this.player;
    const buf = this.buf;

    for (let x = 0; x < DOOM_W; x++) {
      const cameraX = 2 * x / DOOM_W - 1;
      const rayDirX = this.dirX + this.planeX * cameraX;
      const rayDirY = this.dirY + this.planeY * cameraX;

      let mapX = Math.floor(p.x);
      let mapY = Math.floor(p.y);

      const deltaDistX = Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(1 / rayDirY);

      let stepX, stepY, sideDistX, sideDistY;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (p.x - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1 - p.x) * deltaDistX;
      }
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (p.y - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1 - p.y) * deltaDistY;
      }

      // DDA
      let hit = 0, side = 0;
      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        if (mapY >= 0 && mapY < 16 && mapX >= 0 && mapX < 16) {
          if (DOOM_MAP[mapY][mapX] > 0) hit = DOOM_MAP[mapY][mapX];
        } else {
          hit = 1; // Out of bounds
        }
      }

      // Perpendicular distance
      let perpDist;
      if (side === 0) {
        perpDist = (mapX - p.x + (1 - stepX) / 2) / rayDirX;
      } else {
        perpDist = (mapY - p.y + (1 - stepY) / 2) / rayDirY;
      }

      this.zBuffer[x] = perpDist;

      // Wall column
      const lineHeight = Math.floor(DOOM_VIEW_H / perpDist);
      let drawStart = Math.floor(-lineHeight / 2 + DOOM_VIEW_H / 2);
      let drawEnd = Math.floor(lineHeight / 2 + DOOM_VIEW_H / 2);

      // Texture coordinate
      let wallX;
      if (side === 0) {
        wallX = p.y + perpDist * rayDirY;
      } else {
        wallX = p.x + perpDist * rayDirX;
      }
      wallX -= Math.floor(wallX);

      const texX = Math.floor(wallX * DOOM_TEX) & (DOOM_TEX - 1);
      const tex = this.textures[hit - 1];
      if (!tex) continue;

      // Brightness
      let brightness = Math.min(1.0, Math.max(0.15, 1.0 - perpDist / 14));
      if (side === 1) brightness *= 0.7;

      const startClamped = Math.max(0, drawStart);
      const endClamped = Math.min(DOOM_VIEW_H - 1, drawEnd);

      for (let y = startClamped; y <= endClamped; y++) {
        const d = y - drawStart;
        const texY = Math.floor((d / lineHeight) * DOOM_TEX) & (DOOM_TEX - 1);
        const ti = (texY * DOOM_TEX + texX) * 3;

        const pi = (y * DOOM_W + x) * 4;
        buf[pi] = tex[ti] * brightness | 0;
        buf[pi+1] = tex[ti+1] * brightness | 0;
        buf[pi+2] = tex[ti+2] * brightness | 0;
        buf[pi+3] = 255;
      }
    }
  },

  // ---- Sprite Rendering ----
  renderSprites() {
    const p = this.player;
    const buf = this.buf;

    // Sort by distance (farthest first)
    const visible = this.enemies.filter(e => e.alive);
    visible.sort((a, b) => {
      const da = (a.x - p.x) ** 2 + (a.y - p.y) ** 2;
      const db = (b.x - p.x) ** 2 + (b.y - p.y) ** 2;
      return db - da;
    });

    const invDet = 1.0 / (this.planeX * this.dirY - this.dirX * this.planeY);

    for (const e of visible) {
      const sx = e.x - p.x;
      const sy = e.y - p.y;

      const transformX = invDet * (this.dirY * sx - this.dirX * sy);
      const transformY = invDet * (-this.planeY * sx + this.planeX * sy);

      if (transformY <= 0.1) continue;

      const spriteScreenX = Math.floor(DOOM_W / 2 * (1 + transformX / transformY));
      const spriteH = Math.abs(Math.floor(DOOM_VIEW_H / transformY));
      const spriteW = spriteH;

      const drawStartY = Math.max(0, Math.floor(-spriteH / 2 + DOOM_VIEW_H / 2));
      const drawEndY = Math.min(DOOM_VIEW_H - 1, Math.floor(spriteH / 2 + DOOM_VIEW_H / 2));
      const drawStartX = Math.max(0, spriteScreenX - Math.floor(spriteW / 2));
      const drawEndX = Math.min(DOOM_W - 1, spriteScreenX + Math.floor(spriteW / 2));

      const brightness = Math.min(1.0, Math.max(0.2, 1.0 - transformY / 12));

      // Colours
      let bodyR = 100, bodyG = 180, bodyB = 60; // Green imp
      if (e.hurtTimer > 0) { bodyR = 255; bodyG = 60; bodyB = 60; } // Red flash

      for (let col = drawStartX; col <= drawEndX; col++) {
        if (transformY >= this.zBuffer[col]) continue;

        const texX = (col - (spriteScreenX - spriteW / 2)) / spriteW;

        for (let row = drawStartY; row <= drawEndY; row++) {
          const texY = (row - (Math.floor(-spriteH / 2 + DOOM_VIEW_H / 2))) / spriteH;

          // Simple humanoid shape
          const cx = texX - 0.5;
          const cy = texY - 0.5;

          let draw = false;
          let r = bodyR, g = bodyG, b = bodyB;

          // Head (circle at top)
          if (cy < -0.1 && cy > -0.35 && Math.abs(cx) < 0.15) {
            draw = true;
            r = 180; g = 140; b = 100; // Skin
            // Eyes
            if (cy > -0.28 && cy < -0.22) {
              if ((cx > -0.1 && cx < -0.04) || (cx > 0.04 && cx < 0.1)) {
                r = 255; g = 0; b = 0; // Red eyes
              }
            }
          }
          // Body
          else if (cy >= -0.1 && cy < 0.25 && Math.abs(cx) < 0.2) {
            draw = true;
          }
          // Legs
          else if (cy >= 0.25 && cy < 0.5) {
            if ((cx > -0.18 && cx < -0.03) || (cx > 0.03 && cx < 0.18)) {
              draw = true;
              r = bodyR - 20; g = bodyG - 20; b = bodyB - 20;
            }
          }

          if (draw) {
            const pi = (row * DOOM_W + col) * 4;
            buf[pi] = r * brightness | 0;
            buf[pi+1] = g * brightness | 0;
            buf[pi+2] = b * brightness | 0;
            buf[pi+3] = 255;
          }
        }
      }
    }
  },

  // ---- Weapon ----
  renderWeapon() {
    const buf = this.buf;
    const p = this.player;
    if (p.health <= 0) return;

    const bob = Math.sin(this.walkTimer) * 3;
    const baseX = DOOM_W / 2 - 15;
    const baseY = DOOM_VIEW_H - 40 + bob;
    const frame = this.weapon.frame;

    const offsetY = frame === 1 ? -8 : frame === 2 ? -4 : 0;

    // Gun barrel (grey)
    this._drawRect(buf, baseX + 8, baseY + offsetY, 14, 20, 140, 140, 150);
    // Grip (brown)
    this._drawRect(buf, baseX + 10, baseY + 20 + offsetY, 10, 16, 100, 70, 40);

    // Muzzle flash
    if (frame === 1) {
      this._drawRect(buf, baseX + 6, baseY + offsetY - 10, 18, 10, 255, 255, 100);
      this._drawRect(buf, baseX + 10, baseY + offsetY - 15, 10, 6, 255, 255, 200);
    }
  },

  _drawRect(buf, x, y, w, h, r, g, b) {
    x = Math.floor(x); y = Math.floor(y);
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px < 0 || px >= DOOM_W || py < 0 || py >= DOOM_VIEW_H) continue;
        const i = (py * DOOM_W + px) * 4;
        buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = 255;
      }
    }
  },

  // ---- HUD ----
  renderHUD() {
    const buf = this.buf;
    const p = this.player;

    // HUD background (dark grey bar)
    for (let y = DOOM_VIEW_H; y < DOOM_H; y++) {
      for (let x = 0; x < DOOM_W; x++) {
        const i = (y * DOOM_W + x) * 4;
        buf[i] = 50; buf[i+1] = 50; buf[i+2] = 50; buf[i+3] = 255;
      }
    }

    // Health bar (left)
    const hbX = 8, hbY = DOOM_VIEW_H + 8;
    this._drawRect(buf, hbX, hbY + 14, 80, 8, 80, 0, 0);
    this._drawRect(buf, hbX, hbY + 14, Math.floor(80 * p.health / 100), 8, 220, 0, 0);

    // Ammo bar (right)
    const abX = DOOM_W - 88, abY = DOOM_VIEW_H + 8;
    this._drawRect(buf, abX, abY + 14, 80, 8, 80, 80, 0);
    this._drawRect(buf, abX, abY + 14, Math.floor(80 * p.ammo / 50), 8, 220, 200, 0);

    // Face (center) - simple pixel face
    const fx = DOOM_W / 2 - 10, fy = DOOM_VIEW_H + 5;
    // Face background
    this._drawRect(buf, fx, fy, 20, 24, 200, 160, 100);
    // Eyes
    if (p.health > 60) {
      this._drawRect(buf, fx + 4, fy + 6, 4, 4, 255, 255, 255);
      this._drawRect(buf, fx + 12, fy + 6, 4, 4, 255, 255, 255);
      this._drawRect(buf, fx + 5, fy + 7, 2, 2, 0, 0, 0);
      this._drawRect(buf, fx + 13, fy + 7, 2, 2, 0, 0, 0);
    } else if (p.health > 30) {
      // Squinting
      this._drawRect(buf, fx + 4, fy + 8, 5, 2, 0, 0, 0);
      this._drawRect(buf, fx + 12, fy + 8, 5, 2, 0, 0, 0);
    } else {
      // X eyes (dead-ish)
      this._drawRect(buf, fx + 4, fy + 6, 2, 2, 200, 0, 0);
      this._drawRect(buf, fx + 7, fy + 9, 2, 2, 200, 0, 0);
      this._drawRect(buf, fx + 12, fy + 6, 2, 2, 200, 0, 0);
      this._drawRect(buf, fx + 15, fy + 9, 2, 2, 200, 0, 0);
    }
    // Mouth
    if (p.health > 60) {
      this._drawRect(buf, fx + 6, fy + 16, 8, 3, 150, 50, 50);
    } else if (p.health > 30) {
      this._drawRect(buf, fx + 5, fy + 16, 10, 2, 100, 30, 30);
    } else {
      this._drawRect(buf, fx + 4, fy + 15, 12, 5, 80, 0, 0);
    }

    // Blood on face if damaged
    if (p.health < 50) {
      this._drawRect(buf, fx + 2, fy + 12, 3, 6, 180, 0, 0);
    }
  },

  renderHUDText() {
    const ctx = this.ctx;
    const p = this.player;
    ctx.font = 'bold 9px monospace';

    // Health text
    ctx.fillStyle = '#ff4444';
    ctx.fillText('HEALTH', 8, DOOM_VIEW_H + 10);
    ctx.fillStyle = '#fff';
    ctx.fillText(Math.max(0, p.health), 56, DOOM_VIEW_H + 10);

    // Ammo text
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('AMMO', DOOM_W - 88, DOOM_VIEW_H + 10);
    ctx.fillStyle = '#fff';
    ctx.fillText(p.ammo, DOOM_W - 36, DOOM_VIEW_H + 10);

    // Score
    ctx.fillStyle = '#aaa';
    ctx.font = '8px monospace';
    ctx.fillText('SCORE: ' + p.score, DOOM_W / 2 - 25, DOOM_VIEW_H + 36);

    // Death screen
    if (p.health <= 0) {
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      ctx.fillRect(0, 0, DOOM_W, DOOM_VIEW_H);
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('YOU DIED', DOOM_W / 2 - 55, DOOM_VIEW_H / 2);
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText('Press R to restart', DOOM_W / 2 - 55, DOOM_VIEW_H / 2 + 16);
    }

    // Crosshair
    if (p.health > 0) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(DOOM_W / 2 - 1, DOOM_VIEW_H / 2 - 4, 2, 8);
      ctx.fillRect(DOOM_W / 2 - 4, DOOM_VIEW_H / 2 - 1, 8, 2);
    }
  },

  // ---- Input ----
  bindInput() {
    this._onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','r'].includes(key)) {
        // Only handle if doom window is focused
        if (!this.winState || !document.contains(this.winState.el)) return;
        e.preventDefault();
        this.keys[key] = true;

        if (key === ' ') this.shoot();
        if (key === 'r' && this.player.health <= 0) this.initLevel();
      }
    };
    this._onKeyUp = (e) => {
      const key = e.key.toLowerCase();
      this.keys[key] = false;
    };
    this._onMouseDown = (e) => {
      if (e.button === 0) this.shoot();
    };

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
  },

  unbindInput() {
    if (this._onKeyDown) document.removeEventListener('keydown', this._onKeyDown);
    if (this._onKeyUp) document.removeEventListener('keyup', this._onKeyUp);
    if (this._onMouseDown && this.canvas) this.canvas.removeEventListener('mousedown', this._onMouseDown);
  },
};

function openDoom() {
  DoomGame.open();
}
