import os
import sys
import time
import click
import httpx
import traceback
import logging as log
import shutil
import magic
import gzip

from datetime import datetime
from httpx import ReadTimeout, ConnectError
from psycopg2.errors import UniqueViolation
from shapely.geometry import Point
from fake_useragent import UserAgent
from urllib import parse

import psycopg2
import json

from shapely import wkb
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


def decompress_gz_file(gz_file):
    file_extension = Path(gz_file).suffix
    target_path = Path(str(gz_file).replace(file_extension, ''))

    try:
        with gzip.open(gz_file, 'rb') as f_in:
            with open(target_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)

        log.info(f'decompressed archive to {target_path}')

        return target_path
    except Exception as e:
        log.error(e)

        return


def save_download(download_path, data):
    directories = Path(download_path).parent.resolve()
    Path(directories).mkdir(parents=True, exist_ok=True)

    try:
        with open(download_path, 'wb') as f:
            f.write(data)

        log.info(f'saved archive to {download_path}')
    except PermissionError as e:
        log.error(e)

        return


def load_data(target_path):
    with open(target_path, 'r') as f:
        data = json.load(f)

    return data


def get_mime_type(download_path):
    mime_type = magic.from_file(download_path, mime=True)

    return mime_type


def download_archive(url, user_agent):
    headers = {'User-Agent': user_agent}

    try:
        r = httpx.get(url, headers=headers)
    except ReadTimeout as e:
        time.sleep(1)

        r = download_archive(url, user_agent)
    except ConnectError as e:
        log.error(f'Connection to {url} refused')

        sys.exit(1)

    if r.status_code == httpx.codes.OK:
        return r.content

    return


def fetch_data(url):
    ua = UserAgent()
    user_agent = ua.random
    url_path = parse.urlparse(url).path

    data = download_archive(url, user_agent)
    download_path = Path(f'/tmp/{url_path}')

    save_download(download_path, data)

    if get_mime_type(download_path) == 'application/gzip':
        file_path = decompress_gz_file(download_path)
    else:
        file_path = download_path

    data = load_data(file_path)

    return data


@click.command()
@click.option('--env', '-e', type=str, required=True, help='Set your local dot env path')
@click.option('--url', '-u', type=str, required=True, help='Set url you wish to download')
@click.option('--table', '-t', type=str, required=True, help='Set destination table name')
@click.option('--verbose', '-v', is_flag=True, help='Print more verbose output')
@click.option('--debug', '-d', is_flag=True, help='Print detailed debug output')
def main(env, url, table, verbose, debug):
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
    cur = conn.cursor()
    rows = fetch_data(url)

    date_format = '%Y-%m-%d %H:%M:%S.%f'

    for row in rows:
        regions = []
        updated_at = None
        website = None
        meta_title = None
        meta_description = None
        phone = None
        street = None
        city = None
        postal_code = None
        housenumber = None
        title = None
        description = None
        wkb_geometry = None

        '''
        if 'contactAddressbases' in row:
            print('contactAddressbases\n', row['contactAddressbases'], '\n')
            for r in row['contactAddressbases']:
                for key, value in r.items():
                    if key != 'id':
                        print(f'{key}: {value}\n')

        if 'author' in row:
            print('author\n', row['author'], '\n')

        if 'mediaLicense' in row:
            print('mediaLicense\n', row['mediaLicense'], '\n')
            for key, value in row['mediaLicense'].items():
                if key != 'id':
                    print(f'{key}: {value}\n')
        '''

        if 'shortDescription' in row:
            if 'de' in row['shortDescription']:
                description = row['shortDescription']['de']

        '''
        if 'openingHoursInformations' in row:
            print('openingHoursInformations\n', row['openingHoursInformations'], '\n')
            for r in row['openingHoursInformations']:
                for key, value in r.items():
                    if key != 'id':
                        print(f'{key}: {value}\n')
        '''

        if 'htmlHeadTitle' in row:
            if 'de' in row['htmlHeadTitle']:
                meta_title = row['htmlHeadTitle']['de']

        if 'lastChangeTime' in row:
            updated_at = datetime.strptime(row['lastChangeTime'], date_format)

        if 'contact1' in row:
            if 'address' in row['contact1']:
                if 'city' in row['contact1']['address']:
                    city = row['contact1']['address']['city']

                if 'street' in row['contact1']['address']:
                    street = row['contact1']['address']['street']

                if 'streetNo' in row['contact1']['address']:
                    housenumber = row['contact1']['address']['streetNo']

                if 'zipcode' in row['contact1']['address']:
                    postal_code = row['contact1']['address']['zipcode']

                if 'email' in row['contact1']['address']:
                    mail = row['contact1']['address']['email']

                if 'phone1' in row['contact1']['address']:
                    phone = row['contact1']['address']['phone1']

                if 'homepage' in row['contact1']['address']:
                    if 'de' in row['contact1']['address']['homepage']:
                        website = row['contact1']['address']['homepage']['de']

        '''
        if 'contact2' in row:
            print('contact2\n', row['contact2'], '\n')
            for key, value in row['contact2'].items():
                if key != 'id':
                    print(f'{key}: {value}\n')

        if 'longDescription' in row:
            print('longDescription\n', row['longDescription'], '\n')
            for key, value in row['longDescription'].items():
                if key != 'id':
                    print(f'{key}: {value}\n')
        '''

        if 'regions' in row:
            for r in row['regions']:
                if 'i18nName' in r:
                    if 'de' in r['i18nName']:
                        regions.append(r['i18nName']['de'])

        '''
        if 'metasearchIntegration' in row:
            print('metasearchIntegration\n',row['metasearchIntegration'], '\n')
        '''

        if 'creationTime' in row:
            created_at = datetime.strptime(row['creationTime'], date_format)

        if 'htmlHeadMetaDescription' in row:
            if 'de' in row['htmlHeadMetaDescription']:
                meta_description = row['htmlHeadMetaDescription']['de']

        if 'title' in row:
            if 'de' in row['title']:
                title = row['title']['de']

        '''
        if 'entityState' in row:
            print('entityState\n', row['entityState'], '\n')
            for key, value in row['entityState'].items():
                if key != 'id':
                    print(f'{key}: {value}\n')

        if 'client' in row:
            print('client\n', row['client'], '\n')
            for key, value in row['client'].items():
                if key != 'id':
                    print(f'{key}: {value}\n')

        if 'languages' in row:
            print('languages\n', row['languages'], '\n')
            for r in row['languages']:
                for key, value in r.items():
                    if key != 'id':
                        print(f'{key}: {value}\n')

        if 'metainfos' in row:
            print('metainfos\n', row['metainfos'], '\n')
            for r in row['metainfos']:
                for key, value in r.items():
                    if key != 'id':
                        print(f'{key}: {value}\n')
        '''

        if 'location' in row:
            if 'coordinates' in row['location']:
                if 'latitude' in row['location']['coordinates'] and 'longitude' in row['location']['coordinates']:
                    geometry = Point(row['location']['coordinates']['longitude'], row['location']['coordinates']['latitude'])
                    wkb_geometry = wkb.dumps(geometry, hex=True, srid=4326)

        sql = '''
            INSERT INTO sh_cultural_poi (regions, updated_at, website, meta_title, meta_description,
            phone, street, city, postal_code, housenumber, title, description, wkb_geometry)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING RETURNING id
        '''

        regions_joined = ', '.join(regions)

        try:
            cur.execute(sql, (regions_joined, updated_at, website, meta_title, meta_description,
            phone, street, city, postal_code, housenumber, title, description, wkb_geometry))

            last_inserted_id = cur.fetchone()[0]

            log.info(f'inserted {title} with id {last_inserted_id}')
        except UniqueViolation as e:
            log.error(e)



if __name__ == '__main__':
    sys.excepthook = log_exceptions

    main()
