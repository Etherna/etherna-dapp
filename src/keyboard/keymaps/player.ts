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

export const PlayerActions = {
  PLAYPAUSE: "PLAYPAUSE",
  SKIP_BACKWARD: "SKIP_BACKWARD",
  SKIP_FORWARD: "SKIP_FORWARD",
  CAPTIONS: "CAPTIONS",
  FULL_SCREEN: "FULL_SCREEN",
  PICTURE_IN_PICTURE: "PICTURE_IN_PICTURE",
  MINI_PLAYER: "MINI_PLAYER",
  MUTE: "MUTE",
  VOLUME_UP: "VOLUME_UP",
  VOLUME_DOWN: "VOLUME_DOWN",
  VOLUME_10_PERCENT: "VOLUME_10_PERCENT",
  VOLUME_20_PERCENT: "VOLUME_20_PERCENT",
  VOLUME_30_PERCENT: "VOLUME_30_PERCENT",
  VOLUME_40_PERCENT: "VOLUME_40_PERCENT",
  VOLUME_50_PERCENT: "VOLUME_50_PERCENT",
  VOLUME_60_PERCENT: "VOLUME_60_PERCENT",
  VOLUME_70_PERCENT: "VOLUME_70_PERCENT",
  VOLUME_80_PERCENT: "VOLUME_80_PERCENT",
  VOLUME_90_PERCENT: "VOLUME_90_PERCENT",
  SKIP_10_PERCENT: "SKIP_10_PERCENT",
  SKIP_20_PERCENT: "SKIP_20_PERCENT",
  SKIP_30_PERCENT: "SKIP_30_PERCENT",
  SKIP_40_PERCENT: "SKIP_40_PERCENT",
  SKIP_50_PERCENT: "SKIP_50_PERCENT",
  SKIP_60_PERCENT: "SKIP_60_PERCENT",
  SKIP_70_PERCENT: "SKIP_70_PERCENT",
  SKIP_80_PERCENT: "SKIP_80_PERCENT",
  SKIP_90_PERCENT: "SKIP_90_PERCENT",
} as const

export const PlayerKeymap = {
  [PlayerActions.PLAYPAUSE]: "space", //["space", "k"]
  [PlayerActions.SKIP_BACKWARD]: "left", //["j", "left"], // 5s
  [PlayerActions.SKIP_FORWARD]: "right", //["l", "right"], // 5s
  [PlayerActions.CAPTIONS]: "c",
  [PlayerActions.FULL_SCREEN]: "f",
  [PlayerActions.PICTURE_IN_PICTURE]: "p",
  [PlayerActions.MINI_PLAYER]: "i",
  [PlayerActions.MUTE]: "m",
  [PlayerActions.VOLUME_UP]: "up", // 5%
  [PlayerActions.VOLUME_DOWN]: "down", // 5%
  [PlayerActions.VOLUME_10_PERCENT]: "1",
  [PlayerActions.VOLUME_20_PERCENT]: "2",
  [PlayerActions.VOLUME_30_PERCENT]: "3",
  [PlayerActions.VOLUME_40_PERCENT]: "4",
  [PlayerActions.VOLUME_50_PERCENT]: "5",
  [PlayerActions.VOLUME_60_PERCENT]: "6",
  [PlayerActions.VOLUME_70_PERCENT]: "7",
  [PlayerActions.VOLUME_80_PERCENT]: "8",
  [PlayerActions.VOLUME_90_PERCENT]: "9",
  [PlayerActions.SKIP_10_PERCENT]: "alt+1",
  [PlayerActions.SKIP_20_PERCENT]: "alt+2",
  [PlayerActions.SKIP_30_PERCENT]: "alt+3",
  [PlayerActions.SKIP_40_PERCENT]: "alt+4",
  [PlayerActions.SKIP_50_PERCENT]: "alt+5",
  [PlayerActions.SKIP_60_PERCENT]: "alt+6",
  [PlayerActions.SKIP_70_PERCENT]: "alt+7",
  [PlayerActions.SKIP_80_PERCENT]: "alt+8",
  [PlayerActions.SKIP_90_PERCENT]: "alt+9",
} as const
