import os
from urllib.parse import parse_qs, urlencode, urlsplit

from server import Handler, initialize


if not os.environ.get('DATABASE_URL'):
    raise RuntimeError('Configure DATABASE_URL nas variáveis de ambiente da Vercel.')

initialize()


class handler(Handler):
    def restore_api_path(self):
        parsed = urlsplit(self.path)
        query = parse_qs(parsed.query, keep_blank_values=True)
        original_path = query.pop('__path', [None])[0]
        if original_path and original_path.startswith('/api/'):
            remaining_query = urlencode(query, doseq=True)
            self.path = original_path
            if remaining_query:
                self.path += '?' + remaining_query

    def do_GET(self):
        self.restore_api_path()
        return super().do_GET()

    def do_POST(self):
        self.restore_api_path()
        return super().do_POST()
