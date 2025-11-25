import { renderHook, act } from '@testing-library/react';
import { useRegisterForm } from './useRegisterForm';

describe('useRegisterForm', () => {
  test('estado inicial correcto', () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.formData).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
  });

  test('handleChange actualiza formData y limpia error del campo', () => {
    const { result } = renderHook(() => useRegisterForm());

    // Primero provocamos un error para "name"
    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });
    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toBe('El nombre es requerido');

    // Ahora cambiamos el valor de "name"
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Oscar' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.name).toBe('Oscar');
    expect(result.current.errors.name).toBeUndefined();
  });

  test('validate devuelve false y setea errores cuando el formulario es inválido', () => {
    const { result } = renderHook(() => useRegisterForm());

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toBe('El nombre es requerido');
    expect(result.current.errors.email).toBe('El email es requerido');
    expect(result.current.errors.password).toBe('La contraseña es requerida');
    expect(result.current.errors.confirmPassword).toBe(
      'Confirma tu contraseña',
    );
  });

  test('validate devuelve true cuando el formulario es válido', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Oscar' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'password', value: 'Password1!' },           // 👈 ojo acá
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'confirmPassword', value: 'Password1!' },    // 👈 igual acá
      } as React.ChangeEvent<HTMLInputElement>);
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  test('resetForm limpia todo el estado', () => {
    const { result } = renderHook(() => useRegisterForm());

    // Rellenamos datos y flags
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Oscar' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'password', value: 'Password1' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'confirmPassword', value: 'Password1' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.setIsSubmitting(true);
      result.current.setShowPassword(true);
      result.current.setShowConfirmPassword(true);
    });

    // Reseteamos
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
  });
});
