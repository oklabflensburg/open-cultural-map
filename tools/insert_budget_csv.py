import os
import re
import sys
import click
import traceback
import logging as log
import psycopg2
import csv

from datetime import datetime
from shapely.geometry import Point
from dotenv import load_dotenv
from pathlib import Path



# log uncaught exceptions
def log_exceptions(type, value, tb):
    for line in traceback.TracebackException(type, value, tb).format(chain=True):
        log.exception(line)

    log.exception(value)

    sys.__excepthook__(type, value, tb) # calls default excepthook


def connect_database(env_path):
    try:
        load_dotenv(dotenv_path=Path(env_path))

        conn = psycopg2.connect(
            database = os.getenv('DB_NAME'),
            password = os.getenv('DB_PASS'),
            user = os.getenv('DB_USER'),
            host = os.getenv('DB_HOST'),
            port = os.getenv('DB_PORT')
        )

        conn.autocommit = True

        log.info('connection to database established')

        return conn
    except Exception as e:
        log.error(e)

        sys.exit(1)


def parse_value(value, conversion_func=None):
    if value is None or value == '': 
        return None

    if conversion_func:
        return conversion_func(value)

    return value


def insert_row(cur, row):
    funding_type = row['type']
    designation = row['designation']
    year_2008 = parse_value(row['2008'], float)
    year_2009 = parse_value(row['2009'], float)
    year_2010 = parse_value(row['2010'], float)
    year_2011 = parse_value(row['2011'], float)
    year_2012 = parse_value(row['2012'], float)
    year_2013 = parse_value(row['2013'], float)
    year_2014 = parse_value(row['2014'], float)
    year_2015 = parse_value(row['2015'], float)
    year_2016 = parse_value(row['2016'], float)
    year_2017 = parse_value(row['2017'], float)
    year_2018 = parse_value(row['2018'], float)
    year_2019 = parse_value(row['2019'], float)
    year_2020 = parse_value(row['2020'], float)
    year_2021 = parse_value(row['2021'], float)
    year_2022 = parse_value(row['2022'], float)
    year_2023 = parse_value(row['2023'], float)
    year_2024 = parse_value(row['2024'], float)
    street = row['street']
    housenumber = row['housenumber']
    postcode = row['postcode']
    city = row['city']
    lat = parse_value(row['lat'], float)
    lon = parse_value(row['lon'], float)
    wkb_geometry = None

    if lat and lon:
        point = Point(lon, lat)
        wkb_geometry = point.wkb


    sql = '''
        INSERT INTO fl_cultural_funding (funding_type, designation,
            year_2008, year_2009, year_2010, year_2011, year_2012, year_2013,
            year_2014, year_2015, year_2016, year_2017, year_2018, year_2019,
            year_2020, year_2021, year_2022, year_2023, year_2024, street,
            housenumber, postcode, city, wkb_geometry)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
    '''

    try:
        cur.execute(sql, (funding_type, designation, year_2008, year_2009,
            year_2010, year_2011, year_2012, year_2013, year_2014, year_2015,
            year_2016, year_2017, year_2018, year_2019, year_2020, year_2021,
            year_2022, year_2023, year_2024, street, housenumber, postcode,
            city, wkb_geometry))

        last_inserted_id = cur.fetchone()[0]

        log.info(f'inserted {designation} with id {last_inserted_id}')
    except Exception as e:
        log.error(e)


def read_csv(conn, src):
    cur = conn.cursor()

    with open(src, newline='') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',')
    
        for row in reader:
            insert_row(cur, row)


@click.command()
@click.option('--env', '-e', type=str, required=True, help='Set your local dot env path')
@click.option('--src', '-s', type=click.Path(exists=True), required=True, help='Set src path to your csv')
@click.option('--verbose', '-v', is_flag=True, help='Print more verbose output')
@click.option('--debug', '-d', is_flag=True, help='Print detailed debug output')
def main(env, src, verbose, debug):
    if debug:
        log.basicConfig(format='%(levelname)s: %(message)s', level=log.DEBUG)
    if verbose:
        log.basicConfig(format='%(levelname)s: %(message)s', level=log.INFO)
        log.info(f'set logging level to verbose')
    else:
        log.basicConfig(format='%(levelname)s: %(message)s')

    recursion_limit = sys.getrecursionlimit()
    log.info(f'your system recursion limit: {recursion_limit}')

    conn = connect_database(env)
    data = read_csv(conn, Path(src))


if __name__ == '__main__':
    sys.excepthook = log_exceptions

    main()
