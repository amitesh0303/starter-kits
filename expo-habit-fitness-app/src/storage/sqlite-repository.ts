export interface SQLiteRepository { initialize(): void; getHabits(): Array<{id:string}>; saveHabit(habit: {id:string; name:string}): void; }
export function createSQLiteRepository(): SQLiteRepository { return { initialize() {}, getHabits() { return []; }, saveHabit(_h) {} }; }
