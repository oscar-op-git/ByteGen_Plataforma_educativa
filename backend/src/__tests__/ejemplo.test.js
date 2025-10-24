describe('Prueba básica del backend', function () {
    it('debería sumar correctamente', function () {
        var resultado = 2 + 3;
        expect(resultado).toBe(5);
    });
    it('debería comparar strings correctamente', function () {
        var mensaje = 'Hola Jest';
        expect(mensaje).toContain('Jest');
    });
});
