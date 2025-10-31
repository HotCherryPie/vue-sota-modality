/* eslint-disable sonar/redundant-type-aliases */

// #region Region
/**
 * {@link https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 | Reference}
 *
 * @example
 * "RU"
 */
export type Iso3166Alpha2CountryCode = string;

/**
 * {@link https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 | Reference}
 *
 * @example
 * "RUS"
 */
export type Iso3166Alpha3CountryCode = string;

/**
 * {@link https://en.wikipedia.org/wiki/ISO_3166-2 | Reference}
 *
 * @example
 * "219"
 * "MOS"
 */
export type Iso3166SubdivisionCode = string;

/**
 * {@link https://en.wikipedia.org/wiki/ISO_3166 | Reference}
 *
 * @example
 * "RU-MOS"
 * "RUS-MOS"
 * "MV-08"
 */
export type Iso3166RegionCode = string;
// #endregion

// #region Time
/**
 * {@link https://en.wikipedia.org/wiki/ISO_8601 | Reference}
 *
 * @example
 * "2019-01-25T11:55:33.000Z"
 */
export type Iso8601DateString = string;

/**
 * @example
 * 1722589005850
 */
export type PosixTimestampInMilliseconds = number;

/**
 * @example
 * 172258900
 */
export type PosixTimestampInSeconds = number;
// #endregion

export type AbsoluteUrl = string;
export type RelativeUrl = string;
export type AnyUrl = AbsoluteUrl;

export type UUIDv4 = string;
