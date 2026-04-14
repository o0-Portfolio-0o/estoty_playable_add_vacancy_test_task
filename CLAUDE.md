- Before making any changes, show me the exact code diff (before and after) and wait for my explicit approval.
# Project Overview
Playable ad built in Cocos Creator 3.8.6 (TypeScript)
Top-down 3D resource collection game with drag-to-move controls.
Target build size: under 5MB.

# Tech Stack
- Cocos Creator 3.8.6
- TypeScript
- SkeletalAnimation (NOT Animation) for rigged character animations
- Tween / GSAP-style tweening for UI
- MRAID for ad network integration

# Scene Structure
- Player with drag-to-move touch controls (ray casting to Y=0 plane)
- Resource nodes with damage-state transitions
- Craft bench (upgrade station) with upgrade modal
- Gate (extends ResourceNode) — locked until weapon L3
- Off-screen objective arrow (shows/hides based on game state)
- HUD with resource counter and pop animations
- Start screen, win screen

# Key Scripts
- PlayerController — touch input, ray casting, movement, rotation
- GameManager — central state machine, weapon levels (L1/L2/L3), events
- ResourceManager — tracks collected resources, upgrade requirements
- ObjectiveArrow — off-screen indicator, points to craft bench or gate
- Gate — extends ResourceNode

# Event System
- 'resource-changed' — emitted by ResourceManager
- 'weapon-upgraded' — emitted by GameManager, payload: WeaponLevel
- 'game-win' — emitted by GameManager on win condition

# Important Technical Lessons
- Use SkeletalAnimation not Animation for rigged characters
- Bone socket system via Sockets property for weapon attachment
- Use find() instead of Inspector slots for prefab references
- Always call Tween.stopAllByTarget(node) before starting new tweens
- Use event.getLocation() for mobile touch (not getUILocation)
- Texture compression can increase file size for small textures — test before applying
- Static registry pattern for Obstacle system

# Coding Preferences
- TypeScript strict mode
- OOP approach, extend Component for all game objects
- Clean up all event listeners in onDestroy()
- Always guard with null checks before accessing nodes

# Current Task — Estoty Resubmission
Fixing and improving based on their feedback:

## High Priority
- Fix character movement bug (glitches and stops randomly)
- Add intro camera pan to initial breakable boxes
- Add camera pans when objective changes
- Shrink map size to reduce empty space

## UI
- Add objective text updates center screen ("Gather scrap" → "Upgrade weapon")
- Show "UPGRADE NEEDED" popup when hitting advanced boxes with L1 weapon
- Replace "WOOD" text with wood log sprite, move counter to top right
- Remove unnecessary gate icon from top right

## Level Design
- Group breakables into piles instead of scattered
- Replace L2 boxes blocking fence with locked gate
- Add visual drop zone next to upgrade station
- Grey out area outside starting fence
- Add minimal ground texture

## VFX & Audio
- Speed up box-breaking animations and decay times
- Sync box decay with weapon hit
- Add white blink/outline to interactable boxes
- Sync hit sound effects to animation
- Add VFX on weapon upgrade
- Add background music

## Bonus
- Add striped hazard zone under breakables
- Make broken boxes drop scrap sprites for player to pick up