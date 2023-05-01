import { GuConfig } from '../core/gu-config';
import { Application, IApplicationOptions } from 'pixi.js';
// import { EventSystem } '@pixi/events';
import { gsap, Sine } from 'gsap';
import { AnimatedGIFLoader } from '@pixi/gif';
import Lottie from 'lottie-web';
import * as PIXI from 'pixi.js';
// import { GSDevTools } from 'gsap/GSDevTools';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(PixiPlugin); // GSDevTools
PixiPlugin.registerPIXI(PIXI);
// PIXI.Loader.registerPlugin(AnimatedGIFLoader);

/**
 * GU Animator Controller.
 * Takes a set of animations and manages the playback.
 */
export class GuController {
  private applications: any = {};
  private container!: HTMLElement;
  private config: any;

  public animations: any[] = [];
  public rootTimeline: gsap.core.Timeline | undefined;

  public onMarker: any;

  constructor(config: GuConfig) {
    if (!config) {
      throw new Error('Invalid gu-animator configuration.');
    } else if (!config.container) {
      throw new Error('Invalid gu-animator configuration missing container.');
    }

    this.config = config;
    this.container = config.container;
    this.init();
  }

  /**
   * Init the GU Animator.
   * Setup the PixiJS and Lottie players.
   * @private
   */
  private init() {
    const SIZEW = 1920;
    const SIZEH = 1080;

    this.applications = {
      three: this.initThree(),

      // TODO: Abstract out to a renderer application provider
      // pixi: this.initPixi({
      //   width: SIZEW,
      //   height: SIZEH,
      //   backgroundColor: 0xff00ff, // pink
      //   // backgroundAlpha: 0.5,
      //   sharedTicker: true,
      //   sharedLoader: true,
      //   antialias: false,
      //   clearBeforeRender: true,
      //   resolution: 1,
      // }),
      lottie: this.initLottie(),
    };
  }

  /**
   * Init the PixiJS Application and hook into GSAP ticker.
   * @param options
   * @private
   */
  private initPixi(options: IApplicationOptions) {
    // PIXI Background layer
    const app = new Application(options);

    // Install EventSystem, if not already
    // (PixiJS 6 doesn't add it by default)
    // if (!('events' in app.renderer)) {
    //   app.renderer.addSystem(EventSystem, 'events');
    // }

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

  private initThree() {

  }

  private initLottie() {
    return Lottie;
  }

  private defineAnimations(animations: any) {
    if (animations.length > 0) {
      animations.forEach((animation: any) => {
        const totalDuration = (animation.totalFrames / animation.frameRate) * 1000;
        const target = { frame: 0 };
        const animationTimeline = gsap.timeline({
          id: animation.meta.id,
          paused: true,
          repeat: animation.meta.repeat,
        });

        // Define tween for animation frame
        animationTimeline.to(target, {
          duration: (totalDuration / 1000),
          frame: 1,
          onUpdateParams: [animation],
          onUpdate: function(targetAnimation) {
            const nextMoment = Math.floor(totalDuration * this.progress());
            targetAnimation.instance.goToAndStop(nextMoment); // in milliseconds
            // if (targetAnimation.instance.path === '/assets/pack-opening/') {
            //   console.log(targetAnimation.instance.currentFrame, nextMoment);
            // }
          }
        });
        animation.meta.timeline = animationTimeline;

        // Convert animation markers to GSAP labels
        const markers = animation.instance.markers;
        if (markers?.length > 0) {
          markers.forEach((marker: any) => {

            // Convert marker frame to timeline time
            const markerTime = marker.time / animation.frameRate;
            animation.meta.timeline.addLabel(marker.payload.name, markerTime);
            animation.meta.timeline.call((payload: any, anim: any) => {
              if (this.onMarker) {
                this.onMarker(payload, anim);
              }
            }, [marker.payload, animation], markerTime);
          });
        }

        // TODO: parse the timeline and build into root
        // this.rootTimeline?.add(animationTween, 0);
      });
    } else {
      // animation.play();
      // const animation = animations[0];
      // const totalDuration = (animation.totalFrames / animation.frameRate) * 1000;
      // this.rootTimeline = gsap.timeline({
      //   id: 'root',
      //   x : 1,
      //   duration : (totalDuration / 1000),
      //   repeat : 10,
      //   yoyo : true,
      //   paused : true,
      //   ease : Sine.easeOut,
      //   onUpdateParams : [animation],
      //   onUpdate : function(targetAnimation) {
      //     const nextMoment = Math.floor(totalDuration * this.progress());
      //     targetAnimation.goToAndStop(nextMoment); // in milliseconds
      //     // checkFrame(this, anim, nextMoment);
      //   },
      // });
    }
  }

  public getPixi() {
    return this.applications.pixi;
  }

  public getThree() {
    return this.applications.three;
  }

  /**
   * Returns a reference to Lottie.
   * Lottie.loadAnimation would need to accept a params:
   * {
   *       wrapper: svgContainer,
   *       animType: 'threejs', // svg | html | pixi
   *       loop: false,
   *       autoplay: false,
   *       path: 'data.json',
   *       rendererSettings: {
   *         className: 'animation',
   *         preserveAspectRatio: 'xMidYMid meet',
   *         clearCanvas: true,
   *         pixiApplication: app
   *         assetsPath: '' // path to application
   *       },
   *     }
   */
  public getLottie() {
    return this.applications.lottie;
  }

  public setAnimations(animations: any) {
    this.animations = [...animations];

    // TODO: Define a root timeline if required
    this.rootTimeline = gsap.timeline({
      id: 'timeline',
      // repeat: 10,
      // duration: 20,
      paused : true,
      // ease : Sine.easeOut,
      onUpdateParams : [this],
      onUpdate : function(controller) {
        // const nextMoment = Math.floor(totalDuration * this.progress());
        // targetAnimation.goToAndStop(nextMoment); // in milliseconds
        // checkFrame(this, anim, nextMoment);
        // console.log('Animating root', this.progress(), controller);
      },
    });

    // Define tweens for all the animations
    this.defineAnimations(animations);

    // TODO: Move this debug stuff below into browser extension
    // GSAP timeline tool
    // GSDevTools.create(); // { animation: this.rootTimeline }
    const css = '.gs-dev-tools {z-index: 999;}';
    const head = document.head || document.getElementsByTagName('head')[0];
    const style: any = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    if (style.styleSheet) {
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  public play() {
    if (this.rootTimeline) {
      this.rootTimeline.play();
    }
  }
}
