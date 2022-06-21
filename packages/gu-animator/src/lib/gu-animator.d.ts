import { LitElement } from 'lit';
import { GuController } from './controller/gu-controller';
export interface LoadedEvent {
  date: string;
  target: GuAnimator;
}
export interface ErrorEvent {
  error: any;
  message: string;
  target: GuAnimator;
}
export declare class GuAnimator extends LitElement {
  src: string;
  private container;
  private currentSrc;
  private controller;
  static get styles(): import('lit').CSSResult;
  loadAnimation(url: string): Promise<{
    animations: any[];
  }>;
  connectedCallback(): void;
  getController(): GuController | undefined;
  render(): import('lit-html').TemplateResult<1>;
}
declare global {
  interface HTMLElementTagNameMap {
    'gu-animator': GuAnimator;
  }
}
