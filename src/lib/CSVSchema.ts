/**
 * Copyright 2021 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @typescript-eslint/ban-types */

import * as I from './Internal';
import * as C from './Common';
import { csvCellEscape } from './Utils';

type T = Record<keyof any, any>;

class CSVSchema implements I.ICSVSchema<T> {

    private _dirty: boolean = true;

    private _fnWrite!: C.ICSVFileWriter<T>['write'];

    private _headerLine!: string;

    private readonly _columns: Array<C.ICSVHeaderColumn<T, any>> = [];

    public addColumn<TK extends keyof T>(opts: C.ICSVHeaderColumn<T, TK>): this {

        this._dirty = true;

        this._columns.push(opts);

        return this;
    }

    public createWriter(): C.ICSVFileWriter<T>['write'] {

        this._generateData();
        return this._fnWrite;
    }

    public createHeaderLine(): string {

        this._generateData();
        return this._headerLine;
    }

    /**
     * Regenerate the fn `write` and header line if cache dirty.
     */
    private _generateData(): void {

        if (!this._dirty) {

            return ;
        }

        this._generateFnWrite();
        this._generateHeaderLine();

        this._dirty = false;
    }

    private _generateHeaderLine(): void {

        this._headerLine = this._columns.map((v) => csvCellEscape(v.name)).join(',');
    }

    private _generateFnWrite(): void {

        const lines: string[] = [];

        lines.push(`function genLine(row, eol) {`);

        lines.push(`const segs = [`);

        for (let i = 0; i < this._columns.length; i++) {

            const r = this._columns[i];

            if (r.stringifier) {

                lines.push(`csvCellEscape(schema[${i}].stringifier(row[${JSON.stringify(r.key)}])),`);
            }
            else {

                lines.push(`csvCellEscape(`);
                lines.push(`  typeof row[${JSON.stringify(r.key)}] === 'string' ?`);
                lines.push(`    row[${JSON.stringify(r.key)}] :`);
                lines.push(`    (row[${JSON.stringify(r.key)}] ?? '').toString()`);
                lines.push(`),`);
            }
        }

        lines.push(`];`);
        lines.push(`return segs.join(',') + eol;`);
        lines.push(`}`);
        lines.push(`return async function(rows) {`);
        lines.push(`  if (Array.isArray(rows)) {`);
        lines.push(`    return (await this._fd.write(`);
        lines.push(`      rows.map((r) => genLine(r, this._eol)).join('')`);
        lines.push(`    )).bytesWritten;`);
        lines.push(`  }`);
        lines.push(`  else {`);
        lines.push(`    return (await this._fd.write(genLine(rows, this._eol))).bytesWritten;`);
        lines.push(`  }`);
        lines.push(`};`);

        this._fnWrite = new Function('schema', 'csvCellEscape', lines.join('\n'))(
            this._columns,
            csvCellEscape
        );
    }
}

export function createSchema<T extends {}>(): C.ICSVSchema<T> {

    return new CSVSchema();
}
