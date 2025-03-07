import { HUDDLE_CONTROLS } from './huddle-control';

export type HuddleControl =
  (typeof HUDDLE_CONTROLS)[keyof typeof HUDDLE_CONTROLS];
