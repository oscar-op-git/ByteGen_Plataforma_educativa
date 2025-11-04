describe('Prueba básica del backend', () => {
  it('debería sumar correctamente', () => {
    const resultado = 2 + 3
    expect(resultado).toBe(5)
  })
  it('debería comparar strings correctamente', () => {
    const mensaje = 'Hola Jest'
    expect(mensaje).toContain('Jest')
  })
})
