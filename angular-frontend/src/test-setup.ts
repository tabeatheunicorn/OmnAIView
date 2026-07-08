/**
 * Global Vitest test setup.
 *
 * jsdom (the DOM environment used by the Angular unit-test builder) does not
 * implement `ResizeObserver`, `IntersectionObserver` and a few other layout
 * APIs. Components/directives that rely on them — e.g. ResizeObserverDirective
 * (src/app/shared/resize-observer.directive.ts) — throw `ResizeObserver is not
 * defined` under jsdom, even though they work in a real browser.
 *
 * We stub the API surface actually used (constructor + observe/unobserve/
 * disconnect) so those units can be instantiated in tests. The stub is inert:
 * it never fires resize callbacks, which is fine — the tests here assert
 * component creation, not resize behaviour.
 */
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
