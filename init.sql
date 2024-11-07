-- Create schema
CREATE SCHEMA IF NOT EXISTS graphschema;

-- Create table
CREATE TABLE IF NOT EXISTS graphschema.graphtable (
    id SERIAL PRIMARY KEY,
    triples TEXT
);

-- Insert rows with id from 0 to 1000000 and triples as NULL
INSERT INTO graphschema.graphtable (id, triples)
SELECT generate_series(0, 1000000), NULL;
