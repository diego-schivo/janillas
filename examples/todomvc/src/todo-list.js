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

class TodoList extends WebComponent {

	static get observedAttributes() {
		return ["data-filter", "data-total-items"];
	}

	static get templateName() {
		return "todo-list";
	}

	constructor() {
		super();
	}

	async updateDisplay() {
		// console.log("TodoItem.updateDisplay");
		const ii = this.closest("todo-app").data;
		this.appendChild(this.interpolateDom({
			$template: "",
			style: `display:${parseInt(this.dataset.totalItems) ? "block" : "none"}`,
			items: (() => {
				const c = this.dataset.filter !== "all" ? this.dataset.filter === "completed" : undefined;
				return ii.map(x => ({
					$template: "item",
					...x,
					style: `display:${c === undefined || x.completed === c ? "block" : "none"}`
				}));
			})()
		}));
	}
}

customElements.define("todo-list", TodoList);

export default TodoList;
