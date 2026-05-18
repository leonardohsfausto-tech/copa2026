/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as crons from "../crons.js";
import type * as debug from "../debug.js";
import type * as fix from "../fix.js";
import type * as fix_teams from "../fix_teams.js";
import type * as matches from "../matches.js";
import type * as push from "../push.js";
import type * as pushActions from "../pushActions.js";
import type * as realMatches from "../realMatches.js";
import type * as seed from "../seed.js";
import type * as simulations from "../simulations.js";
import type * as teams from "../teams.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  crons: typeof crons;
  debug: typeof debug;
  fix: typeof fix;
  fix_teams: typeof fix_teams;
  matches: typeof matches;
  push: typeof push;
  pushActions: typeof pushActions;
  realMatches: typeof realMatches;
  seed: typeof seed;
  simulations: typeof simulations;
  teams: typeof teams;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
