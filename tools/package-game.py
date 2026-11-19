"""Package only offline runtime files from an immutable Git commit.

No working-tree gameplay changes enter a release. Evidence and source history stay
in the repository; the downloadable game contains its editor and all local assets.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import tarfile
import zipfile


ROOT = Path(__file__).resolve().parents[1]


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def runtime_file(name):
    p = PurePosixPath(name)
    return (
        (len(p.parts) == 1 and p.suffix in {'.js', '.css', '.html'})
        or name == 'version.json'
        or name.startswith('assets/')
        or name in {
            'tools/drone-maturity.js', 'tools/segment-circle.js',
            'tools/rupture-chamber.js', 'tools/maintenance-reserve.js',
            'tools/enemy-collision.js',
            'tools/skills-panel/index.html', 'tools/skills-panel/panel.js',
            'tools/skills-panel/panel.css',
        }
    )


def entry(z, name, data, records):
    info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o100644 << 16
    z.writestr(info, data)
    records.append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', default='HEAD', help='Git commit/ref to package; never reads uncommitted gameplay')
    parser.add_argument('--output', required=True, type=Path, help='New ZIP path; existing evidence is never overwritten')
    args = parser.parse_args()
    commit = git('rev-parse', '--verify', '--end-of-options', args.ref + '^{commit}').decode().strip()
    if not re.fullmatch(r'[0-9a-f]{40,64}', commit):
        raise ValueError('Expected immutable commit identity')
    version = json.loads(git('show', commit + ':version.json'))
    names = git('ls-tree', '-r', '--name-only', '-z', commit).decode().split('\0')
    selected = sorted(n for n in names if n and runtime_file(n))
    required = {'index.html', 'game.js', 'version.json', 'app-loader.js', 'tools/skills-panel/panel.js'}
    if not required.issubset(selected):
        raise ValueError('Missing runtime entry points')
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    partial = output.with_suffix(output.suffix + '.partial')
    if output.exists() or partial.exists():
        raise FileExistsError('Use a new destination; previous packages are preserved')
    records = []
    proc = subprocess.Popen(['git', '-C', str(ROOT), 'archive', '--format=tar', commit, '--', *selected], stdout=subprocess.PIPE)
    try:
        with zipfile.ZipFile(partial, 'x') as z:
            with tarfile.open(fileobj=proc.stdout, mode='r|') as source:
                for item in source:
                    if item.isdir():
                        continue
                    if not item.isfile() or item.name not in selected or '..' in PurePosixPath(item.name).parts:
                        raise ValueError('Unexpected archive member: ' + item.name)
                    entry(z, item.name, source.extractfile(item).read(), records)
            if proc.wait() != 0:
                raise RuntimeError('git archive failed')
            if {r['path'] for r in records} != set(selected):
                raise ValueError('Runtime file set differs from selected Git files')
            help_text = (
                f'SCREWVIVORS - BUILD {version["build"]}\n'
                f'Canal: {version["channel"]} | Commit: {commit}\n\n'
                'Extraia o ZIP inteiro e abra index.html no navegador.\n'
                'No celular, use a horizontal. O audio inicia depois de um gesto.\n'
                'PC: WASD/setas, mouse para mirar, segurar clique para atirar, R para recarregar.\n'
                'P/Esc pausa; Espaco usa o propulsor depois de adquirir a melhoria.\n'
                'O menu CONFIGURAR SKILLS abre o editor incluido neste pacote.\n\n'
                'Versao de desenvolvimento: nao representa aprovacao de lancamento publico.\n'
                'Codigo, testes, bot e evidencias completos:\n'
                'https://github.com/vbg16/robots-zombies\n'
            ).encode('utf-8')
            entry(z, 'LEIA-ME.txt', help_text, records)
            manifest = {'packageFormat': 1, 'build': version['build'], 'channel': version['channel'], 'sourceCommit': commit, 'files': records}
            info = zipfile.ZipInfo('BUILD-MANIFEST.json', date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, json.dumps(manifest, ensure_ascii=False, indent=2).encode('utf-8'))
    finally:
        if proc.poll() is None:
            proc.terminate()
            proc.wait()
        proc.stdout.close()
    with zipfile.ZipFile(partial) as z:
        if z.testzip() is not None:
            raise ValueError('ZIP CRC validation failed')
        for r in records:
            data = z.read(r['path'])
            if len(data) != r['bytes'] or hashlib.sha256(data).hexdigest() != r['sha256']:
                raise ValueError('ZIP roundtrip differs: ' + r['path'])
    partial.rename(output)
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    output.with_suffix(output.suffix + '.sha256').write_text(f'{digest}  {output.name}\n', encoding='utf-8')
    print(json.dumps({'zip': str(output), 'build': version['build'], 'commit': commit, 'runtimeFiles': len(selected), 'bytes': output.stat().st_size, 'sha256': digest, 'roundtripVerified': True}, ensure_ascii=False))


if __name__ == '__main__':
    main()
