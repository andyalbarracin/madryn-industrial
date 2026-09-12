import { describe, expect, test } from 'vitest';

import { distanciaKm, encajeGeografico } from './geo';

describe('distanciaKm', () => {
  test('la distancia de un punto a sí mismo es cero', () => {
    expect(distanciaKm({ lat: -38.95, lon: -68.06 }, { lat: -38.95, lon: -68.06 })).toBe(0);
  });

  test('Neuquén a Comodoro Rivadavia: unos 780 km', () => {
    const km = distanciaKm({ lat: -38.95, lon: -68.06 }, { lat: -45.86, lon: -67.48 });

    expect(km).toBeGreaterThan(760);
    expect(km).toBeLessThan(800);
  });

  test('es simétrica', () => {
    const a = { lat: -31.54, lon: -68.53 };
    const b = { lat: -38.4, lon: -68.85 };

    expect(distanciaKm(a, b)).toBeCloseTo(distanciaKm(b, a), 6);
  });

  test('un grado de latitud sobre el mismo meridiano son unos 111 km', () => {
    const km = distanciaKm({ lat: -38, lon: -68 }, { lat: -39, lon: -68 });

    expect(km).toBeGreaterThan(110);
    expect(km).toBeLessThan(112);
  });
});

describe('encajeGeografico', () => {
  test('dentro del radio, cuanto más cerca mejor', () => {
    const cerca = encajeGeografico({ distanciaKm: 10, radioKm: 200 });
    const lejos = encajeGeografico({ distanciaKm: 180, radioKm: 200 });

    expect(cerca).toBeGreaterThan(lejos);
    expect(cerca).toBeLessThanOrEqual(1);
  });

  test('en la base misma el encaje es total', () => {
    expect(encajeGeografico({ distanciaKm: 0, radioKm: 200 })).toBe(1);
  });

  test('en el borde del radio todavía hay encaje, pero bajo', () => {
    const borde = encajeGeografico({ distanciaKm: 200, radioKm: 200 });

    expect(borde).toBeGreaterThan(0);
    expect(borde).toBeLessThan(0.3);
  });

  test('más allá del radio decae pero no se anula de golpe', () => {
    // Un proyecto a 1,2 radios no es inalcanzable: es más caro de atender.
    const afuera = encajeGeografico({ distanciaKm: 240, radioKm: 200 });

    expect(afuera).toBeGreaterThan(0);
    expect(afuera).toBeLessThan(encajeGeografico({ distanciaKm: 200, radioKm: 200 }));
  });

  test('muy lejos tiende a cero', () => {
    expect(encajeGeografico({ distanciaKm: 5000, radioKm: 200 })).toBeLessThan(0.01);
  });

  test('sin distancia conocida no se inventa encaje', () => {
    expect(encajeGeografico({ distanciaKm: null, radioKm: 200 })).toBe(0);
  });

  test('un radio inválido no rompe el cálculo', () => {
    expect(encajeGeografico({ distanciaKm: 50, radioKm: 0 })).toBe(0);
    expect(encajeGeografico({ distanciaKm: 50, radioKm: -10 })).toBe(0);
  });
});
