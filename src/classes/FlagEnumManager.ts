/*
 *  Copyright 2021-present Etherna Sagl
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

export default class FlagEnumManager {
  constructor(private value: number = 0) {}

  public get() {
    return this.value
  }

  public set(value: number): this {
    this.value = value
    return this
  }

  public has(key: number): boolean {
    return !!(this.value & key)
  }

  public add(key: number): this {
    this.value |= key
    return this
  }

  public delete(key: number): this {
    this.value &= ~key
    return this
  }

  public toggle(key: number): this {
    this.has(key) ? this.delete(key) : this.add(key)
    return this
  }
}
