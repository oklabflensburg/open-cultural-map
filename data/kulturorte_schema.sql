-- POSTGIS ERWEITERUNG LADEN
CREATE EXTENSION IF NOT EXISTS postgis;


-- TABELLE KULTURORTE SCHLESWIG-HOLSTEIN
DROP TABLE IF EXISTS sh_cultural_poi CASCADE;

CREATE TABLE IF NOT EXISTS sh_cultural_poi (
  id SERIAL,
  regions VARCHAR,
  created_at DATE,
  updated_at DATE,
  website VARCHAR,
  meta_title VARCHAR,
  meta_description VARCHAR,
  phone VARCHAR,
  street VARCHAR,
  city VARCHAR,
  postal_code VARCHAR,
  housenumber VARCHAR,
  title VARCHAR,
  description VARCHAR,
  wkb_geometry GEOMETRY(GEOMETRY, 4326),
  PRIMARY KEY(id)
);


-- GEOMETRY INDEX
CREATE INDEX IF NOT EXISTS sh_cultural_poi_wkb_geometry_idx ON sh_cultural_poi USING GIST (wkb_geometry);
