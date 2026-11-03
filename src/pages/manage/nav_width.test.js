import test from "node:test"
import assert from "node:assert/strict"
import {
  DEFAULT_NAV_WIDTH,
  MAX_NAV_WIDTH,
  MIN_NAV_WIDTH,
  RAIL_WIDTH,
  clampNavWidth,
  widthFromPointerX,
} from "./nav_width.ts"

test("a width inside the range is used as-is after rounding", () => {
  assert.equal(clampNavWidth(300), 300)
  assert.equal(clampNavWidth(300.6), 301)
})

test("widths outside the range clamp instead of breaking the layout", () => {
  assert.equal(clampNavWidth(10), MIN_NAV_WIDTH)
  assert.equal(clampNavWidth(4_000), MAX_NAV_WIDTH)
})

test("a corrupt persisted width falls back to the default", () => {
  assert.equal(clampNavWidth(Number.NaN), DEFAULT_NAV_WIDTH)
  assert.equal(clampNavWidth(Number.POSITIVE_INFINITY), DEFAULT_NAV_WIDTH)
  assert.equal(clampNavWidth(undefined), DEFAULT_NAV_WIDTH)
})

test("dragging the handle to the pointer position sets the panel width", () => {
  assert.deepEqual(widthFromPointerX(320), { width: 320 })
  assert.deepEqual(widthFromPointerX(MAX_NAV_WIDTH + 500), {
    width: MAX_NAV_WIDTH,
  })
})

test("dragging well past the minimum folds the panel into the rail", () => {
  assert.deepEqual(widthFromPointerX(100), { collapse: true })
  // Just below the minimum still widens rather than folding, so a short
  // accidental drag does not hide the labels.
  assert.deepEqual(widthFromPointerX(MIN_NAV_WIDTH - 5), {
    width: MIN_NAV_WIDTH,
  })
})

test("a pointer reading that is not a number keeps the default width", () => {
  assert.deepEqual(widthFromPointerX(Number.NaN), { width: DEFAULT_NAV_WIDTH })
})

test("the rail is narrower than the narrowest panel", () => {
  assert.ok(RAIL_WIDTH < MIN_NAV_WIDTH)
})
