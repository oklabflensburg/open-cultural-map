import os
import sys
import time
import json
import click
import httpx
import traceback
import logging as log
import shutil
import magic
import gzip

from httpx import ReadTimeout
from urllib import parse
from fake_useragent import UserAgent
from pathlib import Path



# log uncaught exceptions
def log_exceptions(type, value, tb):
    for line in traceback.TracebackException(type, value, tb).format(chain=True):
        log.exception(line)

    log.exception(value)

    sys.__excepthook__(type, value, tb) # calls default excepthook


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
    target_path = decompress_gz_file(download_path)

    # data = load_data(target_path)
    # print(data)


@click.command()
@click.option('--url', '-u', type=str, required=True, help='Set url you wish to download')
@click.option('--verbose', '-v', is_flag=True, help='Print more verbose output')
@click.option('--debug', '-d', is_flag=True, help='Print detailed debug output')
def main(url, verbose, debug):
    if debug:
        log.basicConfig(format='%(levelname)s: %(message)s', level=log.DEBUG)
    if verbose:
        log.basicConfig(format='%(levelname)s: %(message)s', level=log.INFO)
        log.info(f'set logging level to verbose')
    else:
        log.basicConfig(format='%(levelname)s: %(message)s')

    recursion_limit = sys.getrecursionlimit()
    log.info(f'your system recursion limit: {recursion_limit}')

    fetch_data(url)


if __name__ == '__main__':
    sys.excepthook = log_exceptions

    main()
