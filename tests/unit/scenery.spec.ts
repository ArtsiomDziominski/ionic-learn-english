import { describe, expect, test } from 'vitest';
import { BIOMES, biomeAt, edgeArt, nodeArt, sceneArt, seedOf, type SceneNode } from '@/art/scenery';
import type { NodeState } from '@/core/course';

const ZIGZAG = [0, 46, 74, 46, 0, -46, -74, -46];

/** Юнит как в разделе A1: три урока, сундук, ещё три урока и кубок. */
function unitNodes(states: NodeState[]): SceneNode[] {
  const kinds: SceneNode['kind'][] = ['lesson', 'lesson', 'lesson', 'chest', 'lesson', 'lesson', 'lesson', 'review'];
  return kinds.map((kind, i) => ({ kind, state: states[i], x: ZIGZAG[i], y: i * 104 + 52 }));
}

const MIDWAY: NodeState[] = ['done', 'done', 'done', 'open', 'current', 'locked', 'locked', 'locked'];
const broken = /NaN|undefined|Infinity/;

describe('мир Лекси', () => {
  test('локации идут по кругу', () => {
    expect(BIOMES.map((b) => b.id)).toEqual(['forest', 'field', 'lake', 'autumn', 'mountains', 'winter']);
    expect(biomeAt(0).id).toBe('forest');
    expect(biomeAt(6).id).toBe('forest');
    expect(biomeAt(8).id).toBe('lake');
  });

  test('сцена каждой локации собирается без битых чисел', () => {
    for (const biome of BIOMES) {
      const scene = sceneArt({
        biome,
        nodes: unitNodes(MIDWAY),
        height: 832,
        seed: seedOf(`a1-u1-${biome.id}`),
        mascot: { top: 200, side: -1 },
        home: true,
      });
      expect(scene.back).not.toMatch(broken);
      expect(scene.front).not.toMatch(broken);
      expect(scene.back.startsWith('<svg')).toBe(true);
    }
  });

  test('раскладка не меняется между открытиями экрана', () => {
    const input = { biome: biomeAt(0), nodes: unitNodes(MIDWAY), height: 832, seed: seedOf('a1-u1'), mascot: { top: 200, side: -1 }, home: true };
    expect(sceneArt(input)).toEqual(sceneArt(input));
  });

  test('нора Лекси — только в первом юните на опушке', () => {
    const base = { biome: biomeAt(0), nodes: unitNodes(MIDWAY), height: 832, seed: 1, mascot: { top: 200, side: -1 } };
    expect(sceneArt({ ...base, home: true }).back).toContain('sc-hole');
    expect(sceneArt({ ...base, home: false }).back).not.toContain('sc-hole');
  });

  test('следы лапок — только на пройденной части тропы', () => {
    const fresh = unitNodes(['current', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked']);
    const base = { biome: biomeAt(0), height: 832, seed: 7, mascot: { top: 200, side: -1 }, home: false };
    expect(sceneArt({ ...base, nodes: unitNodes(MIDWAY) }).back).toContain('tr-paws');
    expect(sceneArt({ ...base, nodes: fresh }).back).not.toContain('tr-paws');
  });

  test('узлы во всех состояниях рисуются', () => {
    const states: NodeState[] = ['done', 'current', 'open', 'locked'];
    for (const biome of BIOMES) {
      for (const kind of ['lesson', 'chest', 'review'] as const) {
        for (const state of states) {
          const art = nodeArt({ kind, state, biome });
          expect(art).toContain('viewBox="-50 -52 100 92"');
          expect(art).not.toMatch(broken);
        }
      }
    }
    // На воде урок — кувшинка, в горах — камень, в лесу — пенёк
    expect(nodeArt({ kind: 'lesson', state: 'done', biome: biomeAt(2) })).toContain('sc-pad');
    expect(nodeArt({ kind: 'lesson', state: 'done', biome: biomeAt(4) })).toContain('sc-rock');
    expect(nodeArt({ kind: 'lesson', state: 'done', biome: biomeAt(0) })).toContain('nd-bark');
  });

  test('переходы между локациями, у воды — берег', () => {
    for (let i = 1; i < 12; i++) {
      const edge = edgeArt(biomeAt(i - 1), biomeAt(i), i);
      expect(edge).not.toMatch(broken);
      expect(edge).toContain(`edge-${biomeAt(i - 1).id}`);
    }
    expect(edgeArt(biomeAt(1), biomeAt(2), 3)).toContain('edge-sand');
    expect(edgeArt(biomeAt(0), biomeAt(1), 3)).not.toContain('edge-sand');
  });
});
