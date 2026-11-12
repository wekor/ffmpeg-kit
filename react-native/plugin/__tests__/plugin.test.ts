import { expect, test } from 'bun:test';
import {
  PACKAGE_PROPERTY,
  resolvePackage,
  setGradlePackage,
  setPodfilePackage,
} from '../src';

test('the package is min unless the app picks one', () => {
  expect(resolvePackage(undefined)).toBe('min');
  expect(resolvePackage({})).toBe('min');
  expect(resolvePackage({ package: 'full' })).toBe('full');
});

test('an unknown package fails prebuild', () => {
  // @ts-expect-error not a package
  expect(() => resolvePackage({ package: 'max' })).toThrow(/use one of min/);
});

test('gradle.properties gets one ffmpegKit.package and keeps the rest', () => {
  const properties = setGradlePackage(
    [
      { type: 'comment', value: 'React Native' },
      { type: 'property', key: 'newArchEnabled', value: 'true' },
      { type: 'property', key: PACKAGE_PROPERTY, value: 'full' },
    ],
    'audio'
  );
  expect(properties).toEqual([
    { type: 'comment', value: 'React Native' },
    { type: 'property', key: 'newArchEnabled', value: 'true' },
    { type: 'property', key: PACKAGE_PROPERTY, value: 'audio' },
  ]);
});

test('Podfile.properties.json gets ffmpegKit.package and keeps the rest', () => {
  expect(setPodfilePackage({ 'expo.jsEngine': 'hermes' }, 'https')).toEqual({
    'expo.jsEngine': 'hermes',
    [PACKAGE_PROPERTY]: 'https',
  });
});
