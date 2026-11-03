#!/usr/bin/env python3
"""Inspect a regular PNG sprite grid without modifying its pixels.

This is structural QA, never visual approval. Example:
python tools/inspect-sprite-sheet.py sheet.png --columns 8 --rows 4
"""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image


def inspect(path, columns, rows, rounded_grid=False):
    if columns < 1 or rows < 1:
        raise ValueError('columns and rows must be positive')
    with Image.open(path) as source:
        source.load()
        if source.format != 'PNG':
            raise ValueError('expected PNG')
        width, height = source.size
        if (width % columns or height % rows) and not rounded_grid:
            raise ValueError('image dimensions are not divisible by the declared grid')
        native_mode = source.mode
        rgba = source.convert('RGBA')
    findings, cells, seen = [], [], {}
    for row in range(rows):
        for column in range(columns):
            rectangle = (round(column * width / columns), round(row * height / rows),
                         round((column + 1) * width / columns), round((row + 1) * height / rows))
            frame = rgba.crop(rectangle)
            cell_width, cell_height = frame.size
            alpha = frame.getchannel('A')
            histogram = alpha.histogram()
            bounds = alpha.getbbox()
            visible_bounds = alpha.point(lambda value: 255 if value >= 128 else 0).getbbox()
            digest = hashlib.sha256(frame.tobytes()).hexdigest()
            identifier = f'{row}:{column}'
            duplicate = seen.get(digest)
            seen.setdefault(digest, identifier)
            touches_edge = bool(bounds and (bounds[0] == 0 or bounds[1] == 0
                                           or bounds[2] == cell_width or bounds[3] == cell_height))
            if not bounds:
                findings.append(f'{identifier}: empty cell')
            if touches_edge:
                findings.append(f'{identifier}: nontransparent pixels reach cell edge; inspect clipping')
            if not histogram[0]:
                findings.append(f'{identifier}: no fully transparent pixels')
            if duplicate:
                findings.append(f'{identifier}: exact duplicate of {duplicate}')
            cells.append({'row': row, 'column': column, 'source_rect': rectangle,
                          'cell_size': list(frame.size), 'bounds': bounds,
                          'visible_bounds_alpha128': visible_bounds,
                          'transparent_pixels': histogram[0],
                          'partial_alpha_pixels': sum(histogram[1:255]),
                          'opaque_pixels': histogram[255],
                          'visible_colors': len({pixel for pixel in frame.getdata() if pixel[3]}),
                          'rgba_sha256': digest, 'duplicate_of': duplicate,
                          'touches_cell_edge': touches_edge})
    return {'file': str(Path(path).resolve()), 'native_mode': native_mode,
            'sheet_size': [width, height], 'grid': [columns, rows],
            'nominal_cell_size': [width / columns, height / rows],
            'rounded_grid': rounded_grid, 'unique_cells': len(seen),
            'visual_review': 'NOT_EVALUATED', 'findings': findings, 'cells': cells}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('image')
    parser.add_argument('--columns', type=int, required=True)
    parser.add_argument('--rows', type=int, required=True)
    parser.add_argument('--rounded-grid', action='store_true',
                        help='Explicitly inspect unequal integer cells from a fractional regular grid')
    parser.add_argument('--report', help='Optional JSON report path; image is never modified')
    args = parser.parse_args()
    try:
        result = inspect(args.image, args.columns, args.rows, args.rounded_grid)
    except (ValueError, OSError) as exc:
        parser.exit(1, f'{exc}\n')
    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if args.report:
        Path(args.report).write_text(rendered + '\n', encoding='utf-8')
    else:
        print(rendered)
