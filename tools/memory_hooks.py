#!/usr/bin/env python3
"""Хуки памяти проекта (.memory/). Только стандартная библиотека, без сети. Любая ошибка — тихий выход 0.

start — в начале сессии печатает INDEX.md и state.md (попадают в контекст).
stop  — в конце: если в репозитории есть изменения, а .memory/ в этой сессии не трогали,
        один раз просит записать итог через memory-update. Второй раз не блокирует.
"""
import json, os, subprocess, sys, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEM = os.path.join(ROOT, '.memory')


def start():
    if not os.path.isdir(MEM):
        return
    for name in ('INDEX.md', 'state.md'):
        p = os.path.join(MEM, name)
        if os.path.exists(p):
            print(f'--- .memory/{name} ---')
            print(open(p, encoding='utf-8').read()[:4000])
    print('Перед новым подходом проверь .memory/dead-ends.md (скилл memory-recall).')


def stop():
    data = {}
    try:
        data = json.loads(sys.stdin.read() or '{}')
    except Exception:
        pass
    if data.get('stop_hook_active'):
        return
    sid = data.get('session_id', 'x')
    flag = os.path.join(os.path.expanduser('~'), '.project-memory', hashlib.md5((ROOT + sid).encode()).hexdigest())
    if os.path.exists(flag):
        return
    out = subprocess.run(['git', '-C', ROOT, 'status', '--porcelain'], capture_output=True, text=True).stdout
    log = subprocess.run(['git', '-C', ROOT, 'log', '--since=6 hours ago', '--name-only', '--pretty=format:'],
                         capture_output=True, text=True).stdout
    changed = [l for l in (out.splitlines() + log.splitlines()) if l.strip()]
    if not changed or any('.memory/' in l for l in changed):
        return
    os.makedirs(os.path.dirname(flag), exist_ok=True)
    open(flag, 'w').close()
    print(json.dumps({'decision': 'block',
                      'reason': 'В этой сессии были изменения, а память проекта не обновлена. '
                                'Запусти скилл memory-update: state.md, новые решения и тупики. '
                                'Если ничего долговечного не произошло — ответь одной строкой «Память: без изменений».'},
                     ensure_ascii=False))


if __name__ == '__main__':
    try:
        {'start': start, 'stop': stop}[sys.argv[1]]()
    except Exception:
        pass
    sys.exit(0)
