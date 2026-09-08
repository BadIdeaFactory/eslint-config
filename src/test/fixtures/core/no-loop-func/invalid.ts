let outer = 1; const made = []; for (const value of [1]) { made.push(() => outer); value; } outer = 2; made;
