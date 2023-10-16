import Database from 'better-sqlite3'

export const nutritiondb = () => { 
    const db = new Database('./nutritiondb/CompFoodSearch.sqlite')
    db.pragma('journal_mode = WAL')
    return db
}