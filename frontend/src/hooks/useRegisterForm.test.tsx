import React from 'react';
import { render } from '@testing-library/react';
import { useRegisterForm } from './useRegisterForm';

// Truco simple para testear hooks con un componente dummy
let hookResult: ReturnType<typeof useRegisterForm>;

function TestComponent() {
  hookResult = useRegisterForm();
  return null;
}

describe('useRegisterForm', () => {
  beforeEach(() => {
    render(<TestComponent />);
  });

  test('estado inicial correcto', () => {
    expect(hookResult.formData).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(hookResult.errors).toEqual({});
    expect(hookResult.isSubmitting).toBe(false);
    expect(hookResult.showPassword).toBe(false);
    expect(hookResult.showConfirmPassword).toBe(false);
  });

  test('handleChange actualiza formData y limpia error del campo', () => {
    hookResult.setIsSubmitting(true);

    // Simulamos que ya había un error en name
    hookResult['setIsSubmitting']; // solo para que TS no se queje del uso
    // accedemos interno para el test
    hookResult.errors.name = 'Error previo';

    hookResult.handleChange({
      target: { name: 'name', value: 'Oscar' },
    } as React.ChangeEvent<HTMLInputElement>);

    expect(hookResult.formData.name).toBe('Oscar');
    expect(hookResult.errors.name).toBeUndefined();
  });

  test('validate devuelve false y setea errores cuando el formulario es inválido', () => {
    // formData está vacío por defecto
    const isValid = hookResult.validate();

    expect(isValid).toBe(false);
    expect(hookResult.errors.name).toBe('El nombre es requerido');
    expect(hookResult.errors.email).toBe('El email es requerido');
    expect(hookResult.errors.password).toBe('La contraseña es requerida');
    expect(hookResult.errors.confirmPassword).toBe('Confirma tu contraseña');
  });

  test('validate devuelve true cuando el formulario es válido', () => {
    // llenamos formData con datos válidos
    hookResult.handleChange({
      target: { name: 'name', value: 'Oscar' },
    } as React.ChangeEvent<HTMLInputElement>);
    hookResult.handleChange({
      target: { name: 'email', value: 'test@example.com' },
    } as React.ChangeEvent<HTMLInputElement>);
    hookResult.handleChange({
      target: { name: 'password', value: 'Password1' },
    } as React.ChangeEvent<HTMLInputElement>);
    hookResult.handleChange({
      target: { name: 'confirmPassword', value: 'Password1' },
    } as React.ChangeEvent<HTMLInputElement>);

    const isValid = hookResult.validate();

    expect(isValid).toBe(true);
    expect(hookResult.errors).toEqual({});
  });

  test('resetForm limpia todo el estado', () => {
    // Populamos algo
    hookResult.handleChange({
      target: { name: 'name', value: 'Oscar' },
    } as React.ChangeEvent<HTMLInputElement>);
    hookResult.setIsSubmitting(true);
    hookResult.setShowPassword(true);
    hookResult.setShowConfirmPassword(true);

    hookResult.resetForm();

    expect(hookResult.formData).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(hookResult.errors).toEqual({});
    expect(hookResult.isSubmitting).toBe(false);
    expect(hookResult.showPassword).toBe(false);
    expect(hookResult.showConfirmPassword).toBe(false);
  });
});
