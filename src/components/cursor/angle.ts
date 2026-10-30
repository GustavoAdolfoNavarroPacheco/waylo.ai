/** The turn, in degrees, that takes angle `from` to angle `to` by the short way round: between -180 and 180. */
export function shortestTurn(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

/** The direction of a movement as the cursor's rotation: 0 points up, 90 points right. */
export function headingOf(dx: number, dy: number): number {
  return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
}
