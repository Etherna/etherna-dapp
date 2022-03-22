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

declare module "micro-down" {
  type MicroDownOptions = {
    preCode?: string
  }
  export function parse(text: string, options?: MicroDownOptions): string
  export function block(text: string, options?: MicroDownOptions): string
  export function inline(text: string): string
  export function inlineBlock(text: string, dontInline: boolean): string
}