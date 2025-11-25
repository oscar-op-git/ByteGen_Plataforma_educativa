import { useRef } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { useOnClickOutside } from './useOnClickOutSide';

function TestComponent({ onOutside }: { onOutside: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(ref, onOutside);

  return (
    <div>
      <div data-testid="inside" ref={ref}>
        Dentro
      </div>
      <div data-testid="outside">Fuera</div>
    </div>
  );
}

describe('useOnClickOutside', () => {
  test('no llama a onOutside cuando se hace click dentro', () => {
    const handler = jest.fn();

    render(<TestComponent onOutside={handler} />);

    const inside = screen.getByTestId('inside');
    fireEvent.mouseDown(inside);

    expect(handler).not.toHaveBeenCalled();
  });

  test('llama a onOutside cuando se hace click fuera', () => {
    const handler = jest.fn();

    render(<TestComponent onOutside={handler} />);

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
