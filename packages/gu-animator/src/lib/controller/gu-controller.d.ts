import { GuConfig } from '../core/gu-config';
/**
 * GU Animator Controller.
 * Takes a set of animations and manages the playback.
 */
export declare class GuController {
  private applications;
  private animations;
  private container;
  private rootTimeline;
  constructor(config: GuConfig);
  private init;
  private initPixi;
  private initLottie;
  getPixi(): any;
  /**
   * Returns a reference to Lottie.
   * Lottie.loadAnimation would need to accept a params:
   * {
   *       wrapper: svgContainer,
   *       animType: 'pixi', // svg
   *       loop: false,
   *       autoplay: false,
   *       path: 'data.json',
   *       rendererSettings: {
   *         className: 'animation',
   *         preserveAspectRatio: 'xMidYMid meet',
   *         clearCanvas: true,
   *         pixiApplication: app
   *       },
   *     }
   */
  getLottie(): any;
  setAnimations(animations: any): void;
  play(): void;
}
