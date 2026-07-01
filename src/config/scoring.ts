/**
 * 「今行くべき」スコアの重み・調整値 (docs/specs/scoring.md)。
 * ロジック本体には直書きせずここに分離する (docs/standards/coding.md #品質ゲート)。
 */

export const SCORING_WEIGHTS = {
  desire: 0.3,
  age: 0.25,
  unseen: 0.2,
  context: 0.15,
  novelty: 0.1,
} as const;

/** 保存からの経過日数がこの値で頭打ちになり f_age が最大化する (docs/specs/scoring.md)。 */
export const AGE_SATURATION_DAYS = 180;

/** 直近提案からの経過日数がこの値で頭打ちになり f_unseen が最大化する。 */
export const UNSEEN_SATURATION_DAYS = 30;

/** 「もう一回」直後に直前候補の抽選重みへ掛ける減衰係数 (docs/specs/decide-flow.md)。 */
export const REROLL_DECAY_FACTOR = 0.2;
