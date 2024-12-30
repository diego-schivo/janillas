/*
 * Copyright (c) 2024, Diego Schivo. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Diego Schivo designates
 * this particular file as subject to the "Classpath" exception as
 * provided by Diego Schivo in the LICENSE file that accompanied this
 * code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Diego Schivo, diego.schivo@janilla.com or visit
 * www.janilla.com if you need additional information or have any questions.
 */
export class UpdatableElement extends HTMLElement {

	#update = {};

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log(`UpdatableElement(${this.constructor.name}).connectedCallback`);
		this.requestUpdate();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log(`UpdatableElement(${this.constructor.name}).attributeChangedCallback`, "name", name, "oldValue", oldValue, "newValue", newValue);
		if (this.isConnected && newValue !== oldValue)
			this.requestUpdate();
	}

	requestUpdate() {
		// console.log(`UpdatableElement(${this.constructor.name}).requestUpdate`);
		if (this.#update.ongoing) {
			this.#update.repeat = true;
			return;
		}

		if (typeof this.#update.timeoutID === "number")
			clearTimeout(this.#update.timeoutID);

		this.#update.timeoutID = setTimeout(async () => await this.updateTimeout(), 1);
	}

	async updateTimeout() {
		// console.log(`UpdatableElement(${this.constructor.name}).updateTimeout`);
		this.#update.timeoutID = undefined;
		this.#update.ongoing = true;
		try {
			await this.updateDisplay();
		} finally {
			this.#update.ongoing = false;
		}
		// console.log(`UpdatableElement(${this.constructor.name}).updateTimeout`, "this.#update.repeat", this.#update.repeat);
		if (this.#update.repeat) {
			this.#update.repeat = false;
			this.requestUpdate();
		}
	}

	async updateDisplay() {
		// console.log(`UpdatableElement(${this.constructor.name}).updateDisplay`);
	}
}
