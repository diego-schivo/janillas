/*
 * MIT License
 *
 * Copyright (c) 2024-2025 Diego Schivo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { WebComponent } from "../node_modules/janillas/web-component.js";

class TodoBottombar extends WebComponent {

	static get observedAttributes() {
		return ["data-active-items", "data-filter", "data-total-items"];
	}

	static get templateName() {
		return "todo-bottombar";
	}

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("TodoBottombar.connectedCallback");
		super.connectedCallback();
		this.addEventListener("click", this.handleClick);
	}

	disconnectedCallback() {
		// console.log("TodoBottombar.disconnectedCallback");
		super.disconnectedCallback();
		this.removeEventListener("click", this.handleClick);
	}

	handleClick = event => {
		// console.log("TodoBottombar.handleClick", event);
		if (event.target.matches(".clear-completed-button"))
			this.dispatchEvent(new CustomEvent("clear-completed", { bubbles: true }));
	}

	async updateDisplay() {
		// console.log("TodoBottombar.updateDisplay");
		const aii = parseInt(this.dataset.activeItems);
		this.appendChild(this.interpolateDom({
			$template: "",
			style: `display:${parseInt(this.dataset.totalItems) ? "block" : "none"}`,
			todoStatusText: `${aii} ${aii === 1 ? "item" : "items"} left!`,
			filterItems: ["all", "active", "completed"].map(x => ({
				$template: "filter-item",
				id: `filter-link-${x}`,
				class: `filter-link ${x === this.dataset.filter ? "selected" : ""}`,
				href: `#/${x !== "all" ? x : ""}`,
				text: `${x.charAt(0).toUpperCase()}${x.substring(1)}`
			}))
		}));
	}
}

customElements.define("todo-bottombar", TodoBottombar);

export default TodoBottombar;
