import { GuConfig } from '../core/gu-config';
import {
  Application, Loader, Text, Ticker, Sprite, Container, BLEND_MODES, IApplicationOptions
} from 'pixi.js';
import { gsap, Sine } from 'gsap';
import { AnimatedGIFLoader } from '@pixi/gif';
import Lottie from 'lottie-web';
import * as PIXI from 'pixi.js';
import { GSDevTools } from 'gsap/GSDevTools';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(PixiPlugin, GSDevTools);
PixiPlugin.registerPIXI(PIXI);
PIXI.Loader.registerPlugin(AnimatedGIFLoader);

/**
 * GU Animator Controller.
 * Takes a set of animations and manages the playback.
 */
export class GuController {

  private applications: any = {};
  private animations: any[] = [];
  private container!: HTMLElement;
  private rootTimeline: gsap.core.Timeline | undefined;

  constructor(config: GuConfig) {
    if (!config) {
      throw new Error('Invalid gu-animator configuration.');
    } else if (!config.container) {
      throw new Error('Invalid gu-animator container.');
    }

    this.container = config.container;
    this.init();
  }

  private init() {
    const SIZEW = 1920;
    const SIZEH = 1080;

    this.applications = {
      pixi: this.initPixi({
        width: SIZEW,
        height: SIZEH,
        backgroundColor: 0xFF00FF, // pink
        // backgroundAlpha: 0.5,
        sharedTicker: true,
        sharedLoader: true,
        antialias: false,
        clearBeforeRender: true,
        resolution: 1
      }),
      lottie: this.initLottie()
    }
  }

  private initPixi(options: IApplicationOptions) {
    // PIXI Background layer
    const app = new Application(options);

    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(app.view);
    } else {
      throw new Error('Invalid gu-animator container.');
    }

    // We stop Pixi ticker using stop() function because autoStart = false does NOT stop the shared ticker:
    // doc: http://pixijs.download/release/docs/PIXI.Application.html
    app.ticker.stop();
    gsap.ticker.add(() => {
      app.ticker.update();
    });
    return app;
  }

  private initLottie() {
    return Lottie;
  }

  public getPixi() {
    return this.applications.pixi;
  }

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
  public getLottie() {
    return this.applications.lottie;
  }

  public setAnimations(animations: any) {
    this.animations = animations;

    const animation = animations[0];
    console.log('Set animation', animation);

    this.rootTimeline = gsap.timeline({
      x: 1,
      duration: 5,
      repeat: 10,
      yoyo: true,
      paused: true,
      ease: Sine.easeOut,
      onUpdateParams: [animation],
      onUpdate: function(targetAnimation) {
        const totalDuration = animation.totalFrames/animation.frameRate*1000;
        const nextMoment = Math.floor(totalDuration * this.progress());
        targetAnimation.goToAndStop(nextMoment); // in milliseconds
        // checkFrame(this, anim, nextMoment);
      }
    });

    // TODO: Move this debug stuff below into browser extension
    // GSAP timeline tool
    GSDevTools.create({animation: this.rootTimeline});
    const css = '.gs-dev-tools {z-index: 999;}';
    const head = document.head || document.getElementsByTagName('head')[0];
    const style: any = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    if (style.styleSheet){
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  public play() {
    console.log('GuAnimator::play()', this.rootTimeline);
    if (this.rootTimeline) {
      this.rootTimeline.play();
    }
  }
}
