import './app.element.scss';
import '@immutable/gu-animator';
import { html, LitElement } from 'lit';
import { customElement, eventOptions, property } from 'lit/decorators.js';

@customElement('animator-examples')
export class AppElement extends LitElement {
  @eventOptions({ passive: true })
  onLoaded(event) {
    console.log('Examples loaded:', event);
  }

  @eventOptions({ passive: true })
  onError(event) {
    console.log('Examples error:', event);
  }

  override render() {
    const title = 'GU Animator examples';
    return html`
      <div class="wrapper">
        <div class="container">
          <!--  WELCOME  -->
          <div id="welcome" style="margin-bottom:40px;">
            <h1>
              <span> Hello there, </span>
              Welcome ${title} 👋
            </h1>
          </div>

          <gu-animator
            src="/assets/pack-opening/data.json"
            @loaded=${this.onLoaded}
            @error=${this.onError}
          ></gu-animator>
        </div>
      </div>
    `;
  }
}
