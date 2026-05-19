import pool from './pool.js'

export async function migrate() {
  await pool.query(`ALTER TABLE Prisoner ADD COLUMN IF NOT EXISTS mugshot_img_key TEXT`)

  try {
    await pool.query(`ALTER TABLE Person DROP CONSTRAINT person_identification_no_key`)
  } catch {
    // already dropped or never existed as a constraint
  }

  try {
    await pool.query(`DROP INDEX person_identification_no_key`)
  } catch {
    // already dropped or never existed as a standalone index
  }

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS person_identification_no_nn_key
    ON Person(identification_no)
    WHERE identification_no IS NOT NULL
  `)

  // Sync SERIAL sequences that may be behind due to explicit-id inserts in seed data
  await pool.query(`
    SELECT setval(pg_get_serial_sequence('person',          'id'), COALESCE((SELECT MAX(id) FROM Person),          0) + 1, false)
  `)
  await pool.query(`
    SELECT setval(pg_get_serial_sequence('prisonerintake',  'id'), COALESCE((SELECT MAX(id) FROM PrisonerIntake),  0) + 1, false)
  `)
  await pool.query(`
    SELECT setval(pg_get_serial_sequence('prisoner',        'id'), COALESCE((SELECT MAX(id) FROM Prisoner),        0) + 1, false)
  `)
  await pool.query(`
    SELECT setval(pg_get_serial_sequence('confiscateditem', 'id'), COALESCE((SELECT MAX(id) FROM ConfiscatedItem), 0) + 1, false)
  `)

  // Remove Person rows orphaned by prisoner intake deletes (not referenced by any role table)
  try {
    await pool.query(`
      DELETE FROM Person
      WHERE id NOT IN (SELECT person_id FROM Prisoner    WHERE person_id IS NOT NULL)
        AND id NOT IN (SELECT person_id FROM Officer      WHERE person_id IS NOT NULL)
        AND id NOT IN (SELECT person_id FROM Nurse        WHERE person_id IS NOT NULL)
        AND id NOT IN (SELECT person_id FROM Maintainer   WHERE person_id IS NOT NULL)
        AND id NOT IN (SELECT person_id FROM Document     WHERE person_id IS NOT NULL)
    `)
  } catch {
    // skip if any FK constraint prevents deletion
  }
}
