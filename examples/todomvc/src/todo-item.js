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

class TodoItem extends WebComponent {

	static get templateName() {
		return "todo-item";
	}

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("TodoItem.connectedCallback");
		super.connectedCallback();
		this.addEventListener("change", this.handleChange);
		this.addEventListener("click", this.handleClick);
		this.addEventListener("keyup", this.handleKeyUp);
	}

	disconnectedCallback() {
		// console.log("TodoItem.disconnectedCallback");
		super.disconnectedCallback();
		this.removeEventListener("change", this.handleChange);
		this.removeEventListener("click", this.handleClick);
		this.removeEventListener("keyup", this.handleKeyUp);
	}

	handleBlur = event => {
		// console.log("TodoItem.handleBlur", event);
		event.currentTarget.removeEventListener("blur", this.handleBlur);
		delete this.dataset.edit;
		this.requestDisplay();
	}

	handleChange = event => {
		// console.log("TodoItem.handleChange", event);
		if (event.target.matches(".toggle-todo-input"))
			this.dispatchEvent(new CustomEvent("toggle-item", {
				bubbles: true,
				detail: {
					id: this.dataset.id,
					completed: event.target.checked,
				}
			}));
	}

	handleClick = event => {
		// console.log("TodoItem.handleClick", event);
		if (event.target.matches(".todo-item-text")) {
			if (!this.dataset.edit) {
				const t = new Date().getTime();
				const x = this.textClickTime ? t - this.textClickTime : 0;
				this.textClickTime = t;
				if (x > 0 && x < 500) {
					this.dataset.edit = true;
					this.requestDisplay();
				}
			}
		} else if (event.target.matches(".remove-todo-button"))
			this.dispatchEvent(new CustomEvent("remove-item", {
				bubbles: true,
				detail: { id: this.dataset.id }
			}));
	}

	handleKeyUp = event => {
		// console.log("TodoItem.handleKeyUp", event);
		switch (event.key) {
			case "Enter":
				if (event.target.value !== this.dataset.title) {
					if (!event.target.value)
						this.dispatchEvent(new CustomEvent("remove-item", {
							bubbles: true,
							detail: { id: this.dataset.id }
						}));
					else
						this.dispatchEvent(new CustomEvent("update-item", {
							bubbles: true,
							detail: {
								id: this.dataset.id,
								title: event.target.value
							}
						}));
				}
				break;
			case "Esc":
				break;
			default:
				return;
		}
		this.querySelector(".edit-todo-input").blur();
	}

	async updateDisplay() {
		// console.log("TodoItem.updateDisplay");
		this.appendChild(this.interpolateDom({
			$template: "",
			...this.dataset,
			class: `todo-item ${this.dataset.edit ? "editing" : ""}`
		}));
		if (this.dataset.edit) {
			const el = this.querySelector(".edit-todo-input");
			el.value = this.dataset.title;
			el.focus();
			el.addEventListener("blur", this.handleBlur);
		} else
			this.querySelector(".toggle-todo-input").checked = this.dataset.completed === "true";
	}
}

customElements.define("todo-item", TodoItem);

export default TodoItem;
