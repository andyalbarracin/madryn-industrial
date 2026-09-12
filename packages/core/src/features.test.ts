import { describe, expect, test } from 'vitest';

import { MAD_FEATURES, isFeatureEnabled, parseEnabledFeatures } from './features';

describe('parseEnabledFeatures', () => {
  test('lee una lista separada por comas', () => {
    const enabled = parseEnabledFeatures('radar,entidades');

    expect([...enabled].sort()).toEqual(['entidades', 'radar']);
  });

  test('normaliza espacios y mayúsculas', () => {
    const enabled = parseEnabledFeatures('  Radar , CURACION  ');

    expect([...enabled].sort()).toEqual(['curacion', 'radar']);
  });

  test('ignora nombres que no son features conocidas', () => {
    const enabled = parseEnabledFeatures('radar,inventado,,fuentes');

    expect([...enabled].sort()).toEqual(['fuentes', 'radar']);
  });

  test('sin valor no habilita nada: deny-by-default', () => {
    expect(parseEnabledFeatures(undefined).size).toBe(0);
    expect(parseEnabledFeatures('').size).toBe(0);
    expect(parseEnabledFeatures('   ').size).toBe(0);
  });

  test('acepta las cinco sub-superficies declaradas', () => {
    const enabled = parseEnabledFeatures(MAD_FEATURES.join(','));

    expect(enabled.size).toBe(MAD_FEATURES.length);
  });
});

describe('isFeatureEnabled', () => {
  test('true cuando la feature está en la lista', () => {
    expect(isFeatureEnabled('radar', 'radar,fuentes')).toBe(true);
  });

  test('false cuando la feature no está en la lista', () => {
    expect(isFeatureEnabled('curacion', 'radar,fuentes')).toBe(false);
  });

  test('false cuando no hay lista', () => {
    expect(isFeatureEnabled('radar', undefined)).toBe(false);
  });
});
