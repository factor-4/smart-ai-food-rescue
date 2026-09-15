DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'bag_embeddings') THEN
        ALTER TABLE bag_embeddings
            DROP CONSTRAINT IF EXISTS bag_embeddings_bag_id_fkey,
            ADD CONSTRAINT bag_embeddings_bag_id_fkey
                FOREIGN KEY (bag_id) REFERENCES bags(id) ON DELETE CASCADE;
    END IF;
END $$;