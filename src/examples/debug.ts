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

import * as $CSV from '../lib';

interface ILine {

    name: string;

    age: number;
}
(async () => {

    const schema = $CSV.createSchema<ILine>();

    schema.addColumn({
        key: 'name',
        name: 'Name',
    });

    schema.addColumn({
        key: 'age',
        name: 'Age'
    });

    const file = await $CSV.openFile({
        schema,
        path: './test.csv',
        addBOM: true,
        addHeaders: true
    });

    await file.write({ name: 'ff"f', age: 24 });
    await file.write({ name: '丽娜', age: 23 });
    await file.write({ name: 's,f', age: 23 });
    await file.write({ name: 's,fa"g"a', age: 23 });
    await file.write({ name: 's,fa"g"a', age: 23 });
    await file.write({ name: 's,fa"\ng"a', age: 23 });

    await file.write([
        { name: 'ff"f', age: 24 },
        { name: '丽娜', age: 23 },
        { name: 's,f', age: 23 },
        { name: 's,fa"g"a', age: 23 },
        { name: 's,fa"g"a', age: 23 },
        { name: 's,fa"\ng"a', age: 23 },
    ]);

    await file.write({ name: 'Mick', age: 23 });

    await file.writeRawLine(['Angus', '25', 'Developer']);
    await file.writeRawLines([
        ['Edith', '21', 'Officer'],
        ['John', '29', 'Teacher,Writer'],
        ['Sofia', '15', 'Student']
    ]);

})().catch(console.error);
