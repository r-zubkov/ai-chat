import { isMobileDevice } from './is-mobile-device';

type MockEnvConfig = {
  isSmallViewport: boolean;
  maxTouchPoints: number;
  userAgent: string;
};

const createMediaQueryList = (matches: boolean): MediaQueryList => {
  const mediaQueryList: MediaQueryList = {
    matches,
    media: '(max-width: 1024px)',
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  };

  return mediaQueryList;
};

describe('isMobileDevice', () => {
  let originalUserAgentDescriptor: PropertyDescriptor | undefined;
  let originalMaxTouchPointsDescriptor: PropertyDescriptor | undefined;
  let originalMatchMediaDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalUserAgentDescriptor = Object.getOwnPropertyDescriptor(navigator, 'userAgent');
    originalMaxTouchPointsDescriptor = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints');
    originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
  });

  afterEach(() => {
    restoreProperty(navigator, 'userAgent', originalUserAgentDescriptor);
    restoreProperty(navigator, 'maxTouchPoints', originalMaxTouchPointsDescriptor);
    restoreProperty(window, 'matchMedia', originalMatchMediaDescriptor);
  });

  const mockEnvironment = ({ isSmallViewport, maxTouchPoints, userAgent }: MockEnvConfig): void => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: maxTouchPoints,
    });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: jest.fn(() => createMediaQueryList(isSmallViewport)),
    });
  };

  it('returns false for a desktop environment without touch', () => {
    mockEnvironment({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
      isSmallViewport: false,
    });

    expect(isMobileDevice()).toBe(false);
  });

  it('returns true for a mobile user agent', () => {
    mockEnvironment({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      maxTouchPoints: 0,
      isSmallViewport: false,
    });

    expect(isMobileDevice()).toBe(true);
  });

  it('returns true for a touch device with a small viewport', () => {
    mockEnvironment({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 5,
      isSmallViewport: true,
    });

    expect(isMobileDevice()).toBe(true);
  });
});

function restoreProperty(
  target: object,
  key: PropertyKey,
  descriptor: PropertyDescriptor | undefined,
): void {
  if (descriptor) {
    Object.defineProperty(target, key, descriptor);
    return;
  }

  Reflect.deleteProperty(target, key);
}
