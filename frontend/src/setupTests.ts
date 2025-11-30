// frontend/src/setupTests.ts
import '@testing-library/jest-dom';

// Usamos el objeto global de Jest (Node)
declare const global: any;

/**
 * Polyfill TextEncoder / TextDecoder
 * Necesario para react-router en entorno Node + jsdom
 */
if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const util = require('util');

  global.TextEncoder =
    util.TextEncoder ||
    class TextEncoder {
      encode(str: string) {
        const encoder = new (require('util').TextEncoder)();
        return encoder.encode(str);
      }
    };
}

if (typeof global.TextDecoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const util = require('util');

  global.TextDecoder =
    util.TextDecoder ||
    class TextDecoder {
      decode(bytes: Uint8Array) {
        const decoder = new (require('util').TextDecoder)();
        return decoder.decode(bytes);
      }
    };
}

/**
 * Polyfill ResizeObserver
 * Necesario para golden-layout en Jest (jsdom no lo trae)
 */
if (typeof global.ResizeObserver === 'undefined') {
  class ResizeObserver {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor() {
      // no hacemos nada, solo evitar que falle
    }
    observe(_target?: Element) {
      // noop
    }
    unobserve(_target?: Element) {
      // noop
    }
    disconnect() {
      // noop
    }
  }

  global.ResizeObserver = ResizeObserver;
}
