#!./venv/bin/python

import csv
import click
import json
import re

from geojson import FeatureCollection, Feature, Point
from pathlib import Path


def read_input(src):
    features = []

    with open(src, 'r') as f:
        reader = csv.DictReader(f)

        for row in reader:
            properties = {}
            geometries = {}

            properties['venue_url'] = row['venue_url']
            properties['event_tags'] = row['event_tags']
            properties['venue_open'] = row['venue_open']
            properties['venue_close'] = row['venue_close']

            properties['venue_name'] = row['venue_name']
            properties['venue_street'] = row['venue_street']
            properties['venue_housenumber'] = row['venue_housenumber']
            properties['venue_postal_code'] = row['venue_postal_code']
            properties['venue_city'] = row['venue_city']

            properties['activity_time'] = row['activity_time']
            properties['activity_title'] = row['activity_title']

            properties['event_description_de'] = row['event_description_de']
            properties['event_description_dk'] = row['event_description_dk']
            properties['event_title'] = row['event_title']
            properties['event_image'] = row['event_image']
            properties['event_id'] = row['id']

            properties['slug'] = get_slug(row['venue_name'], row['venue_city'], row['venue_street'])
            geometries['coordinates'] = [row['venue_lat'], row['venue_lon']]

            f = {
                'geometry': geometries,
                'properties': properties
            }

            features.append(f)

    return features


def remove_chars(string):
    slug = string

    tpl = (('©', ''), ('"', ''), ('\\', ''), ('&', 'und'), ('(', ''), (')', ''))

    for item1, item2 in tpl:
        slug = slug.replace(item1, item2)

    return slug


def replace_umlauts(string):
    slug = string

    tpl = (('ü', 'ue'), ('Ü', 'Ue'), ('ä', 'ae'), ('Ä', 'Ae'), ('ö', 'oe'), ('Ö', 'Oe'), ('ß', 'ss'))

    for item1, item2 in tpl:
	    slug = slug.replace(item1, item2)

    return slug


def get_slug(label, city, address):
    title = re.sub(r'[\d\s!@#\$%\^&\*\(\)\[\]{};:,\./<>\?\|`~\-=_\+]', ' ', label)
    addr = re.sub(r'[\s!@#\$%\^&\*\(\)\[\]{};:,\./<>\?\|`~\-=_\+]', ' ', address)

    street = re.sub(r'\d.*', '', address)
    streets = list(set(street.split()))

    for item in streets:
        title = title.replace(item.strip(), '')

    slug = f'{title} {addr} {city}'.lower().strip()
    slug = remove_chars(slug)
    slug = re.sub(r'\s+', ' ', replace_umlauts(slug)).replace(' ', '-')

    return slug


def generate_geojson(features):
    fc = []

    crs = {
        'type': 'name',
        'properties': {
            'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
    }

    for feature in features:
        coordinates = feature['geometry']['coordinates']

        geometry = Point((float(coordinates[1]), float(coordinates[0])))
        properties = feature['properties']

        fc.append(Feature(geometry=geometry, properties=properties))

    c = FeatureCollection(fc, crs=crs)

    return c


@click.command()
@click.argument('src')
def main(src):
    filename = Path(src).stem
    parent = str(Path(src).parent)
    dest = Path(f'{parent}/{filename}.geojson')

    features = read_input(src)
    collection = generate_geojson(features)

    with open(dest, 'w', encoding='utf8') as f:
        json.dump(collection, f, ensure_ascii=False)


if __name__ == '__main__':
    main()
