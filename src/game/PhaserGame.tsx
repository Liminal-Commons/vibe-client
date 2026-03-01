/**
 * React component that creates and manages a Phaser game instance.
 * Bridges between React state (Zustand) and the Phaser scene.
 */

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { CafeScene, type RemotePeer } from "./CafeScene";
import { useVibeStore } from "../store";

export interface PhaserGameProps {
  /** Callback when local player position changes */
  onPositionUpdate?: (x: number, y: number) => void;
}

export function PhaserGame({ onPositionUpdate }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<CafeScene | null>(null);

  // Create the Phaser game on mount
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const scene = new CafeScene({
      onPositionUpdate: (x, y) => {
        useVibeStore.getState().setPosition(x, y);
        onPositionUpdate?.(x, y);
      },
    });
    sceneRef.current = scene;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 800,
      height: 600,
      backgroundColor: "#1a1a2e",
      physics: {
        default: "arcade",
        arcade: { debug: false },
      },
      scene: scene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      input: {
        keyboard: true,
      },
    });

    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync peers from store to scene
  useEffect(() => {
    const unsubscribe = useVibeStore.subscribe((state, prevState) => {
      const scene = sceneRef.current;
      if (!scene) return;

      // Check for peer changes
      if (state.peers !== prevState.peers) {
        // Update existing and add new peers
        for (const peer of state.peers.values()) {
          const remotePeer: RemotePeer = {
            userId: peer.userId,
            displayName: peer.displayName,
            photo: peer.photo,
            x: peer.x,
            y: peer.y,
          };
          scene.updatePeer(remotePeer);
        }

        // Remove peers that are no longer present
        for (const userId of prevState.peers.keys()) {
          if (!state.peers.has(userId)) {
            scene.removePeer(userId);
          }
        }
      }

      // Sync identity name to scene
      if (state.identity.displayName !== prevState.identity.displayName) {
        scene.localName = state.identity.displayName || "You";
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}
