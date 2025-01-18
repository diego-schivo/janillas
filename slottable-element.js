/*
 * Copyright (c) 2024, 2025, Diego Schivo. All rights reserved.
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
import { FlexibleElement } from "./flexible-element.js";

export class SlottableElement extends FlexibleElement {

	constructor() {
		super();
	}

	get state() {
		return this.janillas.state;
	}

	set state(x) {
		if (x !== undefined)
			this.janillas.state = x;
		else
			delete this.janillas.state;
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log(`SlottableElement(${this.constructor.name}).attributeChangedCallback`, "name", name, "oldValue", oldValue, "newValue", newValue);
		super.attributeChangedCallback(name, oldValue, newValue);
		if (!this.slot)
			this.state = undefined;
	}

	async updateDisplay() {
		// console.log("SlottableElement(${this.constructor.name}).updateDisplay");
		this.renderState();
		if (this.slot && !this.state) {
			this.dataset.computeState = "";
			await this.computeState();
			delete this.dataset.computeState;
			if (!this.state)
				throw new Error(`state not computed (${this.constructor.name})`);
			if (this.slot)
				this.requestUpdate();
		}
	}

	async computeState() {
		// console.log("SlottableElement(${this.constructor.name}).computeState");
		this.state = {};
	}

	renderState() {
		// console.log("SlottableElement(${this.constructor.name}).renderState");
		this.appendChild(this.interpolateDom({
			$template: "",
			...this.state
		}));
	}
}
