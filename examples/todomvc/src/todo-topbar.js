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
import { nanoid } from "./nanoid.js";

class TodoTopbar extends WebComponent {

	static get observedAttributes() {
		return ["data-filter", "data-total-items", "data-active-items", "data-completed-items"];
	}

	static get templateName() {
		return "todo-topbar";
	}

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("TodoTopbar.connectedCallback");
		super.connectedCallback();
		this.addEventListener("change", this.handleChange);
		this.addEventListener("keyup", this.handleKeyUp);
	}

	disconnectedCallback() {
		// console.log("TodoTopbar.disconnectedCallback");
		super.disconnectedCallback();
		this.removeEventListener("change", this.handleChange);
		this.removeEventListener("keyup", this.handleKeyUp);
	}

	handleChange = event => {
		// console.log("TodoTopbar.handleChange", event);
		if (event.target.matches(".toggle-all-input"))
			this.dispatchEvent(new CustomEvent("toggle-all", {
				bubbles: true,
				detail: { completed: event.target.checked }
			}));
	}

	handleKeyUp = event => {
		// console.log("TodoTopbar.handleKeyUp", event);
		if (event.key !== "Enter" || !event.target.value)
			return;
		this.dispatchEvent(new CustomEvent("add-item", {
			bubbles: true,
			detail: {
				id: nanoid(),
				title: event.target.value,
				completed: false,
			}
		}));
		event.target.value = "";
	}

	async updateDisplay() {
		// console.log("TodoTopbar.updateDisplay");
		const totalItems = parseInt(this.dataset.totalItems);
		this.appendChild(this.interpolateDom({
			$template: "",
			toggleAllStyle: `display:${totalItems ? "block" : "none"}`
		}));
		if (totalItems) {
			const el = this.querySelector(".toggle-all-input");
			switch (this.dataset.filter) {
				case "active":
					el.checked = false;
					el.disabled = !parseInt(this.dataset.activeItems);
					break;
				case "completed":
					el.checked = parseInt(this.dataset.completedItems);
					el.disabled = !parseInt(this.dataset.completedItems);
					break;
				default:
					el.checked = !parseInt(this.dataset.activeItems);
					el.disabled = false;
			}
		}
	}
}

customElements.define("todo-topbar", TodoTopbar);

export default TodoTopbar;
