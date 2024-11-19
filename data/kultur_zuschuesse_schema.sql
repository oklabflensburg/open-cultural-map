-- POSTGIS ERWEITERUNG LADEN
CREATE EXTENSION IF NOT EXISTS postgis;


-- TABELLE KULTUR FÖRDERUNG FLENSBURG
DROP TABLE IF EXISTS fl_cultural_funding CASCADE;

CREATE TABLE IF NOT EXISTS fl_cultural_funding (
    id SERIAL PRIMARY KEY,
    funding_type VARCHAR,
    designation VARCHAR,
    year_2008 NUMERIC,
    year_2009 NUMERIC,
    year_2010 NUMERIC,
    year_2011 NUMERIC,
    year_2012 NUMERIC,
    year_2013 NUMERIC,
    year_2014 NUMERIC,
    year_2015 NUMERIC,
    year_2016 NUMERIC,
    year_2017 NUMERIC,
    year_2018 NUMERIC,
    year_2019 NUMERIC,
    year_2020 NUMERIC,
    year_2021 NUMERIC,
    year_2022 NUMERIC,
    year_2023 NUMERIC,
    year_2024 NUMERIC,
    street VARCHAR,
    housenumber VARCHAR,
    postcode VARCHAR,
    city VARCHAR,
    wkb_geometry GEOMETRY(POINT, 4326)
);


-- GEOMETRY INDEX
CREATE INDEX IF NOT EXISTS fl_cultural_funding_wkb_geometry_idx ON fl_cultural_funding USING GIST (wkb_geometry);
