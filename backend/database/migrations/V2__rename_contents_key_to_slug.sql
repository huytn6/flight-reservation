SET @contents_key_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'contents'
      AND column_name = 'key'
);

SET @rename_contents_key_sql := IF(
    @contents_key_exists > 0,
    'ALTER TABLE contents RENAME COLUMN `key` TO slug',
    'SELECT 1'
);

PREPARE rename_contents_key_stmt FROM @rename_contents_key_sql;
EXECUTE rename_contents_key_stmt;
DEALLOCATE PREPARE rename_contents_key_stmt;
