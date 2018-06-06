import argparse
import sys
from functools import partial

from mongoengine import connect

from backend.server import Handler, ThreadedServer


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', '-p', type=int, default=8000)
    parser.add_argument('--directory', '-d', default='frontend')
    parser.add_argument('--database', '--db', default='users')

    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()

    connect(args.database)

    handler = partial(Handler, directory=args.directory)
    server = ThreadedServer(('localhost', args.port), handler)

    host, port = server.server_address

    try:
        print('Server started on {0} port {1}'.format(host, port))
        server.serve_forever()
    except KeyboardInterrupt:
        print('Got keyboard interrupt, exiting...')
        sys.exit(0)
