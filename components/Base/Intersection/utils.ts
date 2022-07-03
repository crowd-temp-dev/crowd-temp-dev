import { Config, Entry } from "./types";

export const defaultConfig: Config = {
  threshold: 0,
  rootMargin: "0px 0px 0px 0px",
  root: null,
};

// initial state of entry
export const inactiveEntry: Entry = {
  inactive: true,
  boundingClientRect: undefined,
  intersectionRatio: 0,
  intersectionRect: undefined,
  isIntersecting: false,
  rootBounds: null,
  target: undefined,
  time: 0,
};

export const isHTML = (val: any) => val instanceof HTMLElement;
