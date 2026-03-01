/**
 * Main Phaser scene for the spatial environment.
 * Renders avatars as circles, handles WASD/arrow movement,
 * throttles position updates, and lerps remote avatars.
 */

import Phaser from "phaser";
import { createThrottleState, shouldSendUpdate, markSent, type ThrottleState } from "./throttle";
import { createLerpTarget, lerpPosition, type LerpTarget } from "./lerp";

const SCENE_WIDTH = 1600;
const SCENE_HEIGHT = 1200;
const AVATAR_RADIUS = 24;
const MOVE_SPEED = 200; // pixels per second
const UPDATE_INTERVAL_MS = 100; // 10 Hz
const LERP_DURATION_MS = 120; // slightly longer than update interval for smooth interpolation

export interface RemotePeer {
  userId: string;
  displayName: string;
  photo: string | null;
  x: number;
  y: number;
}

export interface CafeSceneCallbacks {
  onPositionUpdate: (x: number, y: number) => void;
}

export class CafeScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private localAvatar!: Phaser.GameObjects.Container;
  private remoteAvatars = new Map<string, Phaser.GameObjects.Container>();
  private lerpTargets = new Map<string, LerpTarget>();
  private throttleState: ThrottleState = createThrottleState();
  private callbacks: CafeSceneCallbacks;

  // Local position (synced to store externally)
  localX = 400;
  localY = 300;
  localName = "You";

  constructor(callbacks: CafeSceneCallbacks) {
    super({ key: "CafeScene" });
    this.callbacks = callbacks;
  }

  create(): void {
    // Background — simple gradient floor
    const bg = this.add.graphics();
    bg.fillStyle(0x2a1f14, 1);
    bg.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    // Add some floor texture lines
    bg.lineStyle(1, 0x3a2f24, 0.3);
    for (let x = 0; x < SCENE_WIDTH; x += 40) {
      bg.lineBetween(x, 0, x, SCENE_HEIGHT);
    }
    for (let y = 0; y < SCENE_HEIGHT; y += 40) {
      bg.lineBetween(0, y, SCENE_WIDTH, y);
    }

    // World bounds
    this.physics.world.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

    // Local avatar
    this.localAvatar = this.createAvatar(this.localX, this.localY, this.localName, 0x4ecdc4);
    this.cameras.main.startFollow(this.localAvatar, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
  }

  update(_time: number, delta: number): void {
    this.handleMovement(delta);
    this.updateRemoteAvatars();
    this.checkPositionUpdate();
  }

  /** Update a remote peer's target position (called from React) */
  updatePeer(peer: RemotePeer): void {
    const existing = this.remoteAvatars.get(peer.userId);
    if (!existing) {
      // Create new remote avatar
      const avatar = this.createAvatar(peer.x, peer.y, peer.displayName, 0xff6b6b);
      this.remoteAvatars.set(peer.userId, avatar);
    }

    // Set lerp target
    const current = existing ? { x: existing.x, y: existing.y } : { x: peer.x, y: peer.y };
    this.lerpTargets.set(
      peer.userId,
      createLerpTarget(current.x, current.y, peer.x, peer.y, Date.now(), LERP_DURATION_MS),
    );

    // Update name if changed
    const container = this.remoteAvatars.get(peer.userId);
    if (container) {
      const label = container.getAt(1) as Phaser.GameObjects.Text;
      if (label.text !== peer.displayName) {
        label.setText(peer.displayName);
      }
    }
  }

  /** Remove a remote peer (called from React) */
  removePeer(userId: string): void {
    const avatar = this.remoteAvatars.get(userId);
    if (avatar) {
      avatar.destroy();
      this.remoteAvatars.delete(userId);
      this.lerpTargets.delete(userId);
    }
  }

  private createAvatar(
    x: number,
    y: number,
    name: string,
    color: number,
  ): Phaser.GameObjects.Container {
    const circle = this.add.graphics();
    circle.fillStyle(color, 1);
    circle.fillCircle(0, 0, AVATAR_RADIUS);
    circle.lineStyle(2, 0xffffff, 0.8);
    circle.strokeCircle(0, 0, AVATAR_RADIUS);

    const label = this.add.text(0, AVATAR_RADIUS + 6, name, {
      fontSize: "14px",
      color: "#ffffff",
      fontFamily: "sans-serif",
      align: "center",
    });
    label.setOrigin(0.5, 0);

    const container = this.add.container(x, y, [circle, label]);
    return container;
  }

  private handleMovement(delta: number): void {
    if (!this.cursors || !this.wasd) return;

    const speed = (MOVE_SPEED * delta) / 1000;
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd["A"]!.isDown) dx -= speed;
    if (this.cursors.right.isDown || this.wasd["D"]!.isDown) dx += speed;
    if (this.cursors.up.isDown || this.wasd["W"]!.isDown) dy -= speed;
    if (this.cursors.down.isDown || this.wasd["S"]!.isDown) dy += speed;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const factor = Math.SQRT1_2;
      dx *= factor;
      dy *= factor;
    }

    if (dx !== 0 || dy !== 0) {
      this.localX = Phaser.Math.Clamp(this.localX + dx, AVATAR_RADIUS, SCENE_WIDTH - AVATAR_RADIUS);
      this.localY = Phaser.Math.Clamp(
        this.localY + dy,
        AVATAR_RADIUS,
        SCENE_HEIGHT - AVATAR_RADIUS,
      );
      this.localAvatar.setPosition(this.localX, this.localY);
    }
  }

  private updateRemoteAvatars(): void {
    const now = Date.now();
    for (const [userId, target] of this.lerpTargets) {
      const avatar = this.remoteAvatars.get(userId);
      if (!avatar) continue;

      const pos = lerpPosition(target, now);
      avatar.setPosition(pos.x, pos.y);
    }
  }

  private checkPositionUpdate(): void {
    const now = Date.now();
    const x = Math.round(this.localX);
    const y = Math.round(this.localY);

    if (shouldSendUpdate(this.throttleState, x, y, now, UPDATE_INTERVAL_MS)) {
      markSent(this.throttleState, x, y, now);
      this.callbacks.onPositionUpdate(x, y);
    }
  }
}
