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
import * as FS from 'fs/promises';

export interface ICSVHeaderColumn<T extends {}, TK extends keyof T> {

    /**
     * The property name in input structure object.
     */
    'key': TK;

    /**
     * The column name to be display in first line of CSV file.
     */
    'name': string;

    /**
     * Stringify the column value before written into CSV file.
     */
    'stringifier'?: (value: T[TK]) => string;
}

export interface ICSVSchema<T extends {}> {

    /**
     * Register a new column for output.
     */
    addColumn<TK extends keyof T>(column: ICSVHeaderColumn<T, TK>): this;
}

export interface ICSVFileWriter<T extends {}> {

    /**
     * The ending of line for output.
     */
    readonly eol: string;

    /**
     * Write structure lines into CSV file, using schema.
     */
    write(row: T | T[]): Promise<number>;

    /**
     * Write a raw line into CSV file, ignoring schema.
     */
    writeRawLine(row: string[]): Promise<number>;

    /**
     * Write raw lines into CSV file, ignoring schema.
     */
    writeRawLines(row: string[][]): Promise<number>;

    /**
     * Close the file for output.
     */
    close(): Promise<void>;
}

export interface ICSVFileOptions<T extends {}> {

    /**
     * The schema of CSV file.
     */
    schema: ICSVSchema<T>;

    /**
     * The EOL
     */
    eol?: string;

    /**
     * Add the UTF-8 BOM before output.
     *
     * > This option will be ignore if `append === true`
     *
     * @default false
     */
    'addBOM'?: boolean;

    /**
     * Put the column names at the first line of output.
     *
     * > This option will be ignore if `append === true`
     *
     * @default false
     */
    'addHeaders'?: boolean;
}

export interface ICSVFileOpenOptions<T extends {}> extends ICSVFileOptions<T> {

    /**
     * The path to the CSV to be opened.
     *
     * When the file doesn't exist, it will be created.
     */
    'path': string;

    /**
     * Append at the end of file.
     *
     * @default false
     */
    'append'?: boolean;
}

export interface ICSVFileWrapOptions<T extends {}> extends ICSVFileOptions<T> {

    /**
     * The path to the CSV to be opened.
     *
     * When the file doesn't exist, it will be created.
     */
    'fd': FS.FileHandle;
}
