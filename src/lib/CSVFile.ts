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

import * as C from './Common';
import * as I from './Internal';
import * as FS from 'fs/promises';
import { csvCellEscape } from './Utils';

const UTF8_BOM = Buffer.from([0xEF, 0xBB, 0xBF]);

const NEW_LINE = '\r\n';

class CSVFile<T extends {}> implements C.ICSVFileWriter<T> {

    public constructor(
        public readonly write: C.ICSVFileWriter<T>['write'],
        private readonly _fd: FS.FileHandle,
        private readonly _eol: string = NEW_LINE
    ) { }

    public get eol(): string {

        return this._eol;
    }

    public async writeRawLine(row: string[]): Promise<number> {

        return (await this._fd.write(`${row.map((c) => csvCellEscape(c)).join(',')}${this._eol}`)).bytesWritten;
    }

    public async writeRawLines(rows: string[][]): Promise<number> {

        return (await this._fd.write(
            rows.map((row) => `${row.map((c) => csvCellEscape(c)).join(',')}${this._eol}`).join('')
        )).bytesWritten;
    }

    public close(): Promise<void> {

        return this._fd.close();
    }
}

/**
 * Create CSV file operating object by opening file with the path.
 */
export async function openFile<T extends {}>(opts: C.ICSVFileOpenOptions<T>): Promise<C.ICSVFileWriter<T>> {

    const fd = await FS.open(opts.path, opts.append ? 'a' : 'w');

    const schema = (opts.schema as I.ICSVSchema<T>);

    const ret = new CSVFile<T>(
        schema.createWriter(),
        fd,
        opts.eol
    );

    if (!opts.append) {

        if (opts.addBOM ?? false) {

            await fd.write(UTF8_BOM);
        }

        if (opts.addHeaders ?? false) {

            await fd.write(`${schema.createHeaderLine()}${ret.eol}`);
        }
    }

    return ret;
}

/**
 * Create CSV file operating object using the given file descriptor.
 */
export async function useFile<T extends {}>(opts: C.ICSVFileWrapOptions<T>): Promise<C.ICSVFileWriter<T>> {

    const schema = (opts.schema as I.ICSVSchema<T>);

    const ret = new CSVFile<T>(
        schema.createWriter(),
        opts.fd,
        opts.eol
    );

    if (opts.addBOM ?? false) {

        await opts.fd.write(UTF8_BOM);
    }

    if (opts.addHeaders ?? false) {

        await opts.fd.write(`${schema.createHeaderLine()}${ret.eol}`);
    }

    return ret;
}
