import {
  validateEmail,
  validatePasswordStrength,
  isPasswordValid,
  validateName,
} from './validation.utils';

describe('validation.utils', () => {
  test('validateEmail reconoce emails válidos e inválidos', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('otro@mail.co')).toBe(true);
    expect(validateEmail('sin-arroba')).toBe(false);
    expect(validateEmail('a@b')).toBe(false);
    expect(validateEmail('a@b.')).toBe(false);
  });

  test('validatePasswordStrength chequea cada regla', () => {
    const weak = validatePasswordStrength('abc');
    expect(weak.hasMinLength).toBe(false);
    expect(weak.hasUpperCase).toBe(false);
    expect(weak.hasLowerCase).toBe(true);
    expect(weak.hasNumber).toBe(false);
    expect(weak.hasSpecialChar).toBe(false);

    const strong = validatePasswordStrength('Abcdef1!');
    expect(strong.hasMinLength).toBe(true);
    expect(strong.hasUpperCase).toBe(true);
    expect(strong.hasLowerCase).toBe(true);
    expect(strong.hasNumber).toBe(true);
    expect(strong.hasSpecialChar).toBe(true);
  });

  test('isPasswordValid exige largo + mayus + minus + número (pero no special)', () => {
    expect(isPasswordValid('Abcdef12')).toBe(true);   // cumple
    expect(isPasswordValid('abcdef12')).toBe(false);  // sin mayus
    expect(isPasswordValid('ABCDEFG1')).toBe(false);  // sin minus
    expect(isPasswordValid('Abcdefgh')).toBe(false);  // sin número
    expect(isPasswordValid('Ab1')).toBe(false);       // muy corta
  });

  test('validateName requiere mínimo 2 caracteres no vacíos', () => {
    expect(validateName('')).toBe(false);
    expect(validateName(' ')).toBe(false);
    expect(validateName('A')).toBe(false);
    expect(validateName('AB')).toBe(true);
    expect(validateName(' Oscar ')).toBe(true);
  });
});
