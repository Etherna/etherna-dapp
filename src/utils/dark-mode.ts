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

export const DARK_MODE_STORAGE_KEY = "setting:dark-mode"

/**
 * Check user preferences for dark mode
 *
 * @returns true if user prefers dark mode
 */
export const prefersDarkColorScheme = () => {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
}

/**
 * Load color scheme preference in page
 *
 * @returns true if user prefers dark mode
 */
export const loadColorScheme = (darkMode: boolean) => {
  if (darkMode) {
    window.document.documentElement.classList.add("dark")
  } else {
    window.document.documentElement.classList.remove("dark")
  }
  return darkMode
}
