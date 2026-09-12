import { describe, expect, test } from 'vitest';

import { calcularConfianza, calcularPuntaje, encajeDeServicios, frescura } from './scoring';

const BASE = {
  distanciaKm: 40,
  radioKm: 200,
  serviciosRequeridos: ['montaje', 'soldadura'],
  serviciosOfrecidos: ['montaje', 'soldadura', 'izaje'],
  diasDesdeElHecho: 3,
  evidencias: [{ claimKind: 'hecho_de_fuente' as const }],
  faltantes: [] as string[],
};

describe('encajeDeServicios', () => {
  test('todo lo requerido está cubierto', () => {
    expect(encajeDeServicios(['montaje', 'soldadura'], ['montaje', 'soldadura', 'izaje'])).toBe(1);
  });

  test('la mitad cubierta da la mitad', () => {
    expect(encajeDeServicios(['montaje', 'soldadura'], ['montaje'])).toBe(0.5);
  });

  test('nada en común da cero', () => {
    expect(encajeDeServicios(['montaje'], ['catering'])).toBe(0);
  });

  test('no distingue mayúsculas ni espacios sobrantes', () => {
    expect(encajeDeServicios([' Montaje '], ['montaje'])).toBe(1);
  });

  test('sin requerimientos declarados no se afirma encaje', () => {
    // Cero y no uno: que no sepamos qué hace falta no significa que encajemos.
    expect(encajeDeServicios([], ['montaje'])).toBe(0);
  });
});

describe('frescura', () => {
  test('lo de hoy vale al máximo', () => {
    expect(frescura(0)).toBe(1);
  });

  test('decae con los días', () => {
    expect(frescura(30)).toBeLessThan(frescura(5));
  });

  test('a los noventa días queda poco', () => {
    expect(frescura(90)).toBeLessThan(0.2);
  });

  test('sin fecha conocida no se premia frescura', () => {
    expect(frescura(null)).toBe(0);
  });

  test('una fecha futura se trata como hoy', () => {
    expect(frescura(-5)).toBe(1);
  });
});

describe('calcularPuntaje', () => {
  test('devuelve un entero entre 0 y 100', () => {
    const { score } = calcularPuntaje(BASE);

    expect(Number.isInteger(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('un caso fuerte puntúa alto', () => {
    expect(calcularPuntaje(BASE).score).toBeGreaterThan(70);
  });

  test('lejos y sin servicios compatibles puntúa bajo', () => {
    const flojo = calcularPuntaje({
      ...BASE,
      distanciaKm: 1200,
      serviciosOfrecidos: ['catering'],
      diasDesdeElHecho: 200,
    });

    expect(flojo.score).toBeLessThan(15);
  });

  test('los faltantes restan', () => {
    const conFaltantes = calcularPuntaje({ ...BASE, faltantes: ['contacto', 'cuit'] });

    expect(conFaltantes.score).toBeLessThan(calcularPuntaje(BASE).score);
  });

  test('el desglose explica el puntaje: los aportes suman el total', () => {
    const { score, componentes } = calcularPuntaje(BASE);
    const suma = componentes.reduce((total, c) => total + c.aporte, 0);

    expect(Math.round(suma)).toBe(score);
  });

  test('cada componente se puede leer: trae factor y etiqueta', () => {
    const { componentes } = calcularPuntaje(BASE);

    expect(componentes.length).toBeGreaterThanOrEqual(3);
    for (const c of componentes) {
      expect(c.factor).not.toBe('');
      expect(c.etiqueta).not.toBe('');
    }
  });

  test('las penalizaciones aparecen en el desglose con aporte negativo', () => {
    const { componentes } = calcularPuntaje({ ...BASE, faltantes: ['contacto'] });
    const penalizacion = componentes.find((c) => c.aporte < 0);

    expect(penalizacion).toBeDefined();
  });

  test('es pura: la misma entrada da siempre el mismo resultado', () => {
    expect(calcularPuntaje(BASE)).toEqual(calcularPuntaje(BASE));
  });
});

describe('calcularConfianza', () => {
  test('un hecho de fuente sostiene mucho', () => {
    expect(calcularConfianza({ evidencias: [{ claimKind: 'hecho_de_fuente' }], faltantes: [], distanciaConocida: true })).toBeGreaterThan(0.8);
  });

  test('una inferencia sostiene menos que un hecho', () => {
    const hecho = calcularConfianza({ evidencias: [{ claimKind: 'hecho_de_fuente' }], faltantes: [], distanciaConocida: true });
    const inferencia = calcularConfianza({ evidencias: [{ claimKind: 'inferencia' }], faltantes: [], distanciaConocida: true });

    expect(inferencia).toBeLessThan(hecho);
  });

  test('una predicción sostiene menos que una inferencia', () => {
    const inferencia = calcularConfianza({ evidencias: [{ claimKind: 'inferencia' }], faltantes: [], distanciaConocida: true });
    const prediccion = calcularConfianza({ evidencias: [{ claimKind: 'prediccion' }], faltantes: [], distanciaConocida: true });

    expect(prediccion).toBeLessThan(inferencia);
  });

  test('sin evidencia la confianza es muy baja pero no cero', () => {
    const sin = calcularConfianza({ evidencias: [], faltantes: [], distanciaConocida: true });

    expect(sin).toBeGreaterThan(0);
    expect(sin).toBeLessThan(0.25);
  });

  test('los datos faltantes bajan la confianza', () => {
    const limpio = calcularConfianza({ evidencias: [{ claimKind: 'hecho_de_fuente' }], faltantes: [], distanciaConocida: true });
    const incompleto = calcularConfianza({ evidencias: [{ claimKind: 'hecho_de_fuente' }], faltantes: ['cuit', 'contacto'], distanciaConocida: true });

    expect(incompleto).toBeLessThan(limpio);
  });

  test('no saber la distancia baja la confianza', () => {
    const conGeo = calcularConfianza({ evidencias: [{ claimKind: 'hecho_de_fuente' }], faltantes: [], distanciaConocida: true });
    const sinGeo = calcularConfianza({ evidencias: [{ claimKind: 'hecho_de_fuente' }], faltantes: [], distanciaConocida: false });

    expect(sinGeo).toBeLessThan(conGeo);
  });

  test('queda entre 0 y 1 con dos decimales', () => {
    const c = calcularConfianza({
      evidencias: [{ claimKind: 'opinion_humana' }],
      faltantes: ['a', 'b', 'c', 'd', 'e', 'f'],
      distanciaConocida: false,
    });

    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThanOrEqual(1);
    expect(c).toBe(Number(c.toFixed(2)));
  });

  test('el puntaje y la confianza son independientes: mismo puntaje, distinta confianza', () => {
    const conHecho = calcularPuntaje(BASE);
    const conInferencia = calcularPuntaje({ ...BASE, evidencias: [{ claimKind: 'inferencia' }] });

    expect(conInferencia.score).toBe(conHecho.score);
    expect(conInferencia.confidence).toBeLessThan(conHecho.confidence);
  });
});
