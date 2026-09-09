// A place for the `.ts` samples to be linted, and nothing more.
//
// The project service can only supply types for a path some tsconfig already
// covers, so the suite cannot lint at a path it invents. What is committed
// here is irrelevant — every lint replaces the contents with a sample — so it
// is the smallest thing `isolatedModules` still accepts as a module.
export {};
