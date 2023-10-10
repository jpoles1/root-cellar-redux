import sqlite from 'better-sqlite3'

export const nutritiondb = () => {
    return sqlite('./CompFood.sqlite')
}