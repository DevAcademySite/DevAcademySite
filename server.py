"""Servidor local DevAcademy. Python 3.10+, sem pacotes externos."""
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from http.cookies import SimpleCookie
from pathlib import Path
from urllib.parse import urlsplit, unquote, parse_qs
import hashlib, hmac, json, mimetypes, secrets, sqlite3, time, re

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'dados'
DB = DATA / 'devacademy.sqlite3'
ORIGIN = 'http://127.0.0.1:8000'
TRACKS = {'web': {'name': 'Desenvolvimento Web',
         'questions': [{'id': 'html-significado',
                        'pergunta': 'O que significa a sigla HTML?',
                        'alternativas': ['Linguagem de Marcação de Hipertexto',
                                         'Linguagem Moderna de Alta Tecnologia',
                                         'Nível de Hiperlink e Marcação de Texto',
                                         'Linguagem de Marcação de Ferramentas Domésticas'],
                        'respostaCorreta': 0,
                        'explicacao': 'HTML significa HyperText Markup Language, ou Linguagem de Marcação de '
                                      'Hipertexto. Ele organiza o conteúdo da página com elementos como '
                                      'títulos, parágrafos, imagens e links. Por exemplo: <h1>Dev '
                                      'Academy</h1> define um título principal.',
                        'module': 'html'},
                       {'id': 'html-titulo',
                        'module': 'html',
                        'pergunta': 'Qual tag representa o título principal de uma página?',
                        'alternativas': ['<p>', '<h1>', '<a>', '<img>'],
                        'respostaCorreta': 1,
                        'explicacao': 'A tag <h1> marca o título principal do conteúdo. Os títulos seguem '
                                      'uma hierarquia de <h1> a <h6>. Use essa hierarquia para organizar os '
                                      'assuntos, e não apenas para mudar o tamanho da letra.'},
                       {'id': 'html-paragrafo',
                        'module': 'html',
                        'pergunta': 'Como escrever o parágrafo “Estou aprendendo HTML” corretamente?',
                        'alternativas': ['<h1>Estou aprendendo HTML</h1>',
                                         '<img>Estou aprendendo HTML</img>',
                                         '<p>Estou aprendendo HTML</p>',
                                         '<a>Estou aprendendo HTML</a>'],
                        'respostaCorreta': 2,
                        'explicacao': '<p>Estou aprendendo HTML</p> cria um parágrafo. A abertura <p> indica '
                                      'onde ele começa e </p> onde termina. <h1> marca um título; <a> '
                                      'representa um link quando usado com href; <img> incorpora uma '
                                      'imagem.'},
                       {'id': 'html-link',
                        'module': 'html',
                        'pergunta': 'Qual exemplo cria um link para https://example.com?',
                        'alternativas': ['<a href="https://example.com">Visitar site</a>',
                                         '<p href="https://example.com">Visitar site</p>',
                                         '<img href="https://example.com">',
                                         '<a src="https://example.com">Visitar site</a>'],
                        'respostaCorreta': 0,
                        'explicacao': 'A tag <a> cria um link quando recebe o atributo href, que informa o '
                                      'destino. O texto entre <a> e </a> é o texto clicável. O atributo src '
                                      'é usado em elementos como <img> para indicar o recurso que será '
                                      'carregado.'},
                       {'id': 'html-imagem',
                        'module': 'html',
                        'pergunta': 'Em <img src="robo.png" alt="Mascote da DevAcademy">, qual é a função do '
                                    'atributo alt?',
                        'alternativas': ['Definir o tamanho da imagem',
                                         'Mudar a cor do fundo',
                                         'Informar o endereço do arquivo',
                                         'Fornecer uma alternativa textual à imagem'],
                        'respostaCorreta': 3,
                        'explicacao': 'alt fornece uma alternativa textual à imagem. Leitores de tela podem '
                                      'anunciá-la, e o navegador pode exibi-la quando a imagem não carrega. '
                                      'Para uma imagem apenas decorativa, use alt="". O atributo src indica '
                                      'o endereço do arquivo.'}]},
 'backend': {'name': 'Desenvolvimento Backend',
             'questions': [{'id': 'sql-select',
                            'pergunta': 'Qual estrutura SQL é usada para selecionar dados de uma tabela?',
                            'alternativas': ['UPDATE', 'INSERT INTO', 'SELECT', 'DELETE'],
                            'respostaCorreta': 2,
                            'explicacao': 'SELECT é o comando SQL usado para consultar dados. Por exemplo: '
                                          'SELECT nome FROM estudantes; busca a coluna nome da tabela '
                                          'estudantes. Já INSERT INTO insere registros, UPDATE altera dados '
                                          'e DELETE remove registros.',
                            'module': 'sql'}]}}
MODULES = {'web': [{'id': 'html',
          'title': 'HTML: primeiros passos',
          'description': 'Estruture uma página com títulos, parágrafos, links e imagens.',
          'duration': 'Cerca de 5 minutos de leitura',
          'lesson': [{'title': '1. O que é HTML?',
                      'text': 'HTML significa Linguagem de Marcação de Hipertexto. Ele descreve a estrutura '
                              'e o significado do conteúdo de uma página. Pense em um texto organizado com '
                              'título, parágrafos, links e imagens. HTML estrutura esse conteúdo; CSS cuida '
                              'da aparência e JavaScript adiciona comportamentos.'},
                     {'title': '2. Conheça as tags',
                      'text': 'Uma tag é uma marca escrita entre os sinais < e >. Muitos elementos têm uma '
                              'tag de abertura, um conteúdo e uma tag de fechamento. Veja o parágrafo '
                              'abaixo: <p> abre, o texto é o conteúdo e </p> fecha.',
                      'code': '<p>Estou aprendendo HTML!</p>'},
                     {'title': '3. Uma página pequena e completa',
                      'text': '<!DOCTYPE html> declara um documento HTML moderno. <html> envolve o '
                              'documento; lang="pt-BR" informa o idioma. <head> reúne informações como '
                              'codificação e título da aba. <body> contém o conteúdo mostrado na página.',
                      'code': '<!DOCTYPE html>\n'
                              '<html lang="pt-BR">\n'
                              '  <head>\n'
                              '    <meta charset="UTF-8">\n'
                              '    <title>Minha primeira página</title>\n'
                              '  </head>\n'
                              '  <body>\n'
                              '    <h1>Minha jornada na programação</h1>\n'
                              '    <p>Hoje comecei a aprender HTML.</p>\n'
                              '    <a href="https://example.com">Visitar site</a>\n'
                              '  </body>\n'
                              '</html>',
                      'preview': True},
                     {'title': '4. As tags que você vai praticar',
                      'text': '<h1> marca o título principal. <p> marca um parágrafo. <a href="..."> cria um '
                              'link: href indica o destino. <img src="..." alt="..."> incorpora uma imagem: '
                              'src indica o arquivo e alt fornece uma alternativa textual. <img> é um '
                              'elemento vazio, sem tag de fechamento.',
                      'code': '<h1>Meu título principal</h1>\n'
                              '<p>Meu primeiro parágrafo.</p>\n'
                              '<a href="https://example.com">Visitar site</a>\n'
                              '<img src="robo.png" alt="Mascote da DevAcademy">'},
                     {'title': '5. Um cuidado com acessibilidade',
                      'text': 'Uma imagem que informa algo deve ter um texto alternativo adequado ao '
                              'contexto. Uma imagem apenas decorativa pode usar alt="". Organize os títulos '
                              'de <h1> a <h6> em uma hierarquia que faça sentido. Isso ajuda as pessoas a '
                              'entender e navegar pelo conteúdo.'},
                     {'title': 'Sua vez de praticar',
                      'text': 'Você vai responder cinco perguntas sobre HTML, títulos, parágrafos, links e '
                              'imagens. Cada acerto em uma pergunta nova vale 20% do módulo. Se errar, leia '
                              'a explicação; ao terminar, revise as perguntas pendentes. Você pode consultar '
                              'a aula novamente a qualquer momento.'}]}],
 'backend': [{'id': 'sql',
              'title': 'SQL: primeira consulta',
              'description': 'Conheça SELECT e consulte informações de uma tabela.',
              'duration': 'Cerca de 2 minutos de leitura',
              'lesson': [{'title': 'Como consultar dados?',
                          'text': 'SQL é uma linguagem usada para trabalhar com dados em bancos relacionais. '
                                  'SELECT consulta informações, INSERT INTO insere registros, UPDATE altera '
                                  'dados e DELETE remove registros.'},
                         {'title': 'Sua primeira consulta',
                          'text': 'O exemplo busca o nome de todos os registros da tabela estudantes. SELECT '
                                  'indica as colunas desejadas e FROM indica a tabela.',
                          'code': 'SELECT nome FROM estudantes;'}]}]}

def connect():
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    return db

def initialize():
    DATA.mkdir(exist_ok=True)
    with connect() as db:
        db.executescript('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
        password TEXT NOT NULL, recovery TEXT NOT NULL, track TEXT NOT NULL DEFAULT '');
        CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER, expires REAL);
        CREATE TABLE IF NOT EXISTS attempts (ip TEXT, stamp REAL);
        CREATE TABLE IF NOT EXISTS progress (user_id INTEGER, track TEXT, question_id TEXT,
        PRIMARY KEY(user_id, track, question_id));
        CREATE TABLE IF NOT EXISTS module_learning (user_id INTEGER, track TEXT, module_id TEXT,
        started_at REAL NOT NULL, lesson_read INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY(user_id, track, module_id));''')

def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()

def password_hash(value, salt=None):
    salt = salt or secrets.token_hex(16)
    result = hashlib.scrypt(value.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
    return salt + ':' + result

def valid_password(value, saved):
    return hmac.compare_digest(password_hash(value, saved.split(':')[0]), saved)

def public(user):
    return {k: user[k] for k in ('name', 'email', 'track')}


def module_questions(track, module_id):
    return [q for q in TRACKS[track]['questions'] if q['module']==module_id]

def completion(completed, total, started=False):
    percent = round(completed*100/total) if total else 0
    status = 'completed' if total and completed==total else 'in_progress' if started or completed else 'not_started'
    return {'completed':completed, 'total':total, 'percent':percent, 'status':status}

def module_progress(db, user_id, track, module_id):
    ids = {q['id'] for q in module_questions(track,module_id)}
    saved = {row[0] for row in db.execute('SELECT question_id FROM progress WHERE user_id=? AND track=?',(user_id,track))}
    state = db.execute('SELECT lesson_read FROM module_learning WHERE user_id=? AND track=? AND module_id=?',(user_id,track,module_id)).fetchone()
    result = completion(len(ids & saved),len(ids),state is not None)
    result['lesson_read'] = bool(state and state['lesson_read'])
    return result

def track_progress(db, user_id, track):
    modules = [{k:m[k] for k in ('id','title','description','duration')} | {'progress':module_progress(db,user_id,track,m['id'])} for m in MODULES[track]]
    result = completion(sum(m['progress']['completed'] for m in modules),sum(m['progress']['total'] for m in modules),any(m['progress']['status']!='not_started' for m in modules))
    result['modules']=modules
    return result

class Handler(BaseHTTPRequestHandler):
    def reply(self, status, body, content='application/json; charset=utf-8', cookie=None, location=None):
        if not isinstance(body, bytes):
            body = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', content)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Referrer-Policy', 'same-origin')
        if cookie: self.send_header('Set-Cookie', cookie)
        if location: self.send_header('Location', location)
        self.end_headers()
        self.wfile.write(body)

    def user(self):
        cookie = SimpleCookie()
        try: cookie.load(self.headers.get('Cookie', ''))
        except Exception: return None
        token = cookie.get('devacademy_session')
        if not token: return None
        with connect() as db:
            return db.execute('SELECT users.* FROM users JOIN sessions ON users.id=sessions.user_id WHERE token=? AND expires>?', (digest(token.value), time.time())).fetchone()

    def allowed_host(self):
        return self.headers.get('Host') in ('127.0.0.1:8000', 'localhost:8000')

    def do_GET(self):
        if not self.allowed_host(): return self.reply(403, {'error':'Endereço não permitido.'})
        path = unquote(urlsplit(self.path).path)
        if path in ('/api/progress', '/api/quiz'):
            user = self.user()
            if not user: return self.reply(401, {'error':'Entre novamente para continuar.'})
            with connect() as db:
                if path == '/api/progress':
                    return self.reply(200, {'tracks': {key: track_progress(db,user['id'],key) for key in TRACKS}})
                track = parse_qs(urlsplit(self.path).query).get('track',[''])[0]
                if track not in TRACKS: return self.reply(400, {'error':'Selecione uma trilha válida.'})
                module_id = parse_qs(urlsplit(self.path).query).get('module',[''])[0]
                module = next((m for m in MODULES[track] if m['id']==module_id),None)
                if module_id and not module: return self.reply(400, {'error':'Módulo inválido.'})
                item = TRACKS[track]
                selected = module_questions(track,module_id) if module else item['questions']
                questions = [{k:q[k] for k in ('id','pergunta','alternativas','module')} for q in selected]
                saved = {row[0] for row in db.execute('SELECT question_id FROM progress WHERE user_id=? AND track=?',(user['id'],track))}
                return self.reply(200, {'name':item['name'], 'questions':questions, 'completed_ids':[q['id'] for q in selected if q['id'] in saved], 'module':module, 'module_progress':module_progress(db,user['id'],track,module_id) if module else None, 'progress':track_progress(db,user['id'],track)})
        if path == '/api/session':
            user = self.user()
            return self.reply(200, {'user': public(user) if user else None})
        if path in ('/', '/index.html') or path.lower().endswith('/login.html'):
            return self.reply(302, b'', location='/home/home.html#login')
        # Somente estes arquivos são publicados; dados, código Python e Git ficam privados.
        allowed = {'/home/home.html','/home/home.css','/home/home.js','/home/auth.js',
                   '/home/profile.html','/home/profile.js','/Quiz/quiz.teste.html',
                   '/Quiz/quiz.teste.js','/Quiz/quiz.teste.css'}
        image = path.startswith('/img/') and Path(path).suffix.lower() in ('.png','.jpg','.jpeg','.webp','.gif','.svg')
        if path not in allowed and not image: return self.reply(404, {'error':'Página não encontrada.'})
        if (path.startswith('/Quiz/') or path in ('/home/profile.html','/home/profile.js')) and not self.user():
            target = 'profile' if 'profile' in path else 'quiz'
            track = parse_qs(urlsplit(self.path).query).get('track',[''])[0]
            suffix = '&track='+track if track in TRACKS else ''
            module_id = parse_qs(urlsplit(self.path).query).get('module',[''])[0]
            if track in MODULES and any(m['id']==module_id for m in MODULES[track]): suffix += '&module='+module_id
            return self.reply(302, b'', location='/home/home.html?next='+target+suffix+'#login')
        file = (ROOT / path.lstrip('/')).resolve()
        if not file.is_relative_to(ROOT) or not file.is_file(): return self.reply(404, {'error':'Arquivo não encontrado.'})
        content = mimetypes.guess_type(str(file))[0] or 'application/octet-stream'
        return self.reply(200, file.read_bytes(), content)

    def do_POST(self):
        if not self.allowed_host() or self.headers.get('Origin') not in (ORIGIN, 'http://localhost:8000'):
            return self.reply(403, {'error':'Abra o site pelo endereço mostrado no terminal.'})
        if self.headers.get('Content-Type','').split(';')[0] != 'application/json': return self.reply(415, {'error':'Formato inválido.'})
        try:
            length = int(self.headers.get('Content-Length','0'))
            if not 0 < length <= 8192: raise ValueError()
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict) or any(not isinstance(v,str) for v in data.values()): raise ValueError()
        except (ValueError, UnicodeError): return self.reply(400, {'error':'Dados inválidos.'})
        path = urlsplit(self.path).path
        email = data.get('email','').strip().lower()
        password = data.get('password','')
        if path in ('/api/login','/api/register','/api/recover'):
            with connect() as db:
                db.execute('DELETE FROM attempts WHERE stamp<?', (time.time()-300,))
                count = db.execute('SELECT count(*) FROM attempts WHERE ip=?',(self.client_address[0],)).fetchone()[0]
                if count >= 20: return self.reply(429, {'error':'Muitas tentativas. Aguarde cinco minutos.'})
                db.execute('INSERT INTO attempts VALUES (?,?)',(self.client_address[0],time.time()))
            if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',email) or len(email)>254:
                return self.reply(400, {'error':'Informe um e-mail válido.'})
            if not 8 <= len(password) <= 128:
                return self.reply(400, {'error':'A senha deve ter entre 8 e 128 caracteres.'})
        with connect() as db:
            if path == '/api/module':
                user = self.user()
                if not user: return self.reply(401, {'error':'Entre novamente para continuar.'})
                track, module_id = data.get('track',''),data.get('module','')
                if track not in MODULES or not any(m['id']==module_id for m in MODULES[track]):
                    return self.reply(400, {'error':'Módulo inválido.'})
                phase = data.get('phase','start')
                if phase not in ('start','read'): return self.reply(400, {'error':'Etapa inválida.'})
                db.execute('INSERT OR IGNORE INTO module_learning (user_id,track,module_id,started_at) VALUES (?,?,?,?)',(user['id'],track,module_id,time.time()))
                if phase=='read': db.execute('UPDATE module_learning SET lesson_read=1 WHERE user_id=? AND track=? AND module_id=?',(user['id'],track,module_id))
                db.commit()
                return self.reply(200, {'module_progress':module_progress(db,user['id'],track,module_id)})
            if path == '/api/answer':
                user = self.user()
                if not user: return self.reply(401, {'error':'Entre novamente para continuar.'})
                track = data.get('track','')
                if track not in TRACKS: return self.reply(400, {'error':'Trilha inválida.'})
                question = next((q for q in TRACKS[track]['questions'] if q['id']==data.get('question')), None)
                answer = data.get('answer','')
                if not question or answer not in [str(i) for i in range(len(question['alternativas']))]:
                    return self.reply(400, {'error':'Resposta inválida.'})
                correct = int(answer)==question['respostaCorreta']
                if correct:
                    db.execute('INSERT OR IGNORE INTO progress VALUES (?,?,?)', (user['id'],track,question['id']))
                db.commit()
                return self.reply(200, {'correct':correct, 'correctIndex':question['respostaCorreta'], 'explanation':question['explicacao'], 'progress':track_progress(db,user['id'],track), 'module_progress':module_progress(db,user['id'],track,question['module'])})
            if path == '/api/register':
                name = data.get('name','').strip()
                if not 2 <= len(name) <= 80: return self.reply(400, {'error':'Informe um nome de 2 a 80 caracteres.'})
                recovery = secrets.token_hex(16)
                try: db.execute('INSERT INTO users (email,name,password,recovery) VALUES (?,?,?,?)',(email,name,password_hash(password),digest(recovery)))
                except sqlite3.IntegrityError: return self.reply(409, {'error':'Este e-mail já possui cadastro. Entre ou recupere seu acesso.'})
                return self.reply(201, {'recovery':recovery})
            if path == '/api/login':
                user = db.execute('SELECT * FROM users WHERE email=?',(email,)).fetchone()
                if not user or not valid_password(password,user['password']): return self.reply(401, {'error':'E-mail ou senha incorretos.'})
                token = secrets.token_urlsafe(32)
                db.execute('DELETE FROM sessions WHERE expires<?',(time.time(),))
                db.execute('INSERT INTO sessions VALUES (?,?,?)',(digest(token),user['id'],time.time()+8*3600))
                db.commit()
                return self.reply(200, {'user':public(user)}, cookie='devacademy_session='+token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800')
            if path == '/api/recover':
                user = db.execute('SELECT * FROM users WHERE email=?',(email,)).fetchone()
                code = data.get('code','').strip().lower()
                if not user or not hmac.compare_digest(digest(code),user['recovery']): return self.reply(400, {'error':'E-mail ou código de recuperação incorretos.'})
                recovery = secrets.token_hex(16)
                db.execute('UPDATE users SET password=?, recovery=? WHERE id=?',(password_hash(password),digest(recovery),user['id']))
                db.execute('DELETE FROM sessions WHERE user_id=?',(user['id'],))
                return self.reply(200, {'recovery':recovery})
            if path == '/api/logout':
                cookie = SimpleCookie(self.headers.get('Cookie',''))
                if cookie.get('devacademy_session'): db.execute('DELETE FROM sessions WHERE token=?',(digest(cookie['devacademy_session'].value),))
                return self.reply(200, {'ok':True},cookie='devacademy_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
            if path == '/api/profile':
                user = self.user()
                if not user: return self.reply(401, {'error':'Entre novamente para continuar.'})
                name, track = data.get('name','').strip(), data.get('track','')
                if not 2<=len(name)<=80 or track not in ('','Desenvolvimento Web','Desenvolvimento Backend','Full Stack'):
                    return self.reply(400, {'error':'Confira o nome e a trilha.'})
                db.execute('UPDATE users SET name=?,track=? WHERE id=?',(name,track,user['id']))
                return self.reply(200, {'ok':True})
        return self.reply(404, {'error':'Recurso não encontrado.'})

if __name__ == '__main__':
    initialize()
    print('DevAcademy: '+ORIGIN+'/home/home.html', flush=True)
    print('Deixe este terminal aberto. Para encerrar: Ctrl+C.', flush=True)
    try: ThreadingHTTPServer(('127.0.0.1',8000),Handler).serve_forever()
    except KeyboardInterrupt: print('\nServidor encerrado.')
