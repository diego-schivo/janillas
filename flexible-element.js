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
import { UpdatableElement } from "./updatable-element.js";

export class FlexibleElement extends UpdatableElement {

	#initPromise;

	#templates;

	constructor() {
		super();
		this.#initPromise = getDocumentFragment(this.constructor.templateName).then(x => {
			const df = x.cloneNode(true);
			const tt = [...df.querySelectorAll("template")].map(y => {
				y.remove();
				return y;
			});
			this.#templates = Object.fromEntries([
				["", compileNode(df)],
				...tt.map(y => [y.id, compileNode(y.content)])
			].map(([k, v]) => [k, {
				factory: v,
				functions: []
			}]));
		});
	}

	async updateTimeout() {
		// console.log("FlexibleElement.updateTimeout");
		await this.#initPromise;
		await super.updateTimeout();
	}

	async updateDisplay() {
		// console.log("FlexibleElement.updateDisplay");
		this.appendChild(this.interpolateDom());
	}

	interpolateDom(input = { $template: "" }) {
		// console.log("FlexibleElement.interpolateDom");
		const getInterpolate = (template, index) => {
			const x = this.#templates[template];
			for (let i = x.functions.length; i <= index; i++)
				x.functions.push(x.factory());
			return x.functions[index];
		};
		const indexes = {};
		const interpolate = x => {
			if (x === null || typeof x !== "object")
				return x;
			if (Array.isArray(x))
				return x.map(interpolate);
			if (!Object.hasOwn(x, "$template"))
				return x;
			const y = Object.fromEntries(Object.entries(x).filter(([k, _]) => k !== "$template").map(([k, v]) => [k, interpolate(v)]));
			var k = x.$template;
			indexes[k] ??= 0;
			const i = getInterpolate(k, indexes[k]++);
			return i(y);
		};
		return interpolate(input);
	}
}

const documentFragments = {};

const getDocumentFragment = async name => {
	const r = `/${name}.html`;
	documentFragments[name] ??= fetch(r).then(x => {
		if (!x.ok)
			throw new Error(`Failed to fetch ${r}: ${x.status} ${x.statusText}`);
		return x.text();
	}).then(x => {
		const t = document.createElement("template");
		t.innerHTML = x;
		return t.content;
	});
	return await documentFragments[name];
};

const evaluate = (expression, context) => {
	let o = context;
	if (expression)
		for (const k of expression.split(".")) {
			if (o == null)
				break;
			const i = k.endsWith("]") ? k.indexOf("[") : -1;
			o = i === -1 ? o[k] : o[k.substring(0, i)]?.[parseInt(k.substring(i + 1, k.length - 1))];
		}
	return o;
};

const findNode = (node, indexes, attribute) => {
	return indexes.reduce((n, x, i) => (attribute && i === indexes.length - 1 ? n.attributes : n.childNodes)[x], node);
}

const expressionRegex = /\$\{(.*?)\}/g;

const compileNode = node => {
	const ii = [];
	const ff = [];
	for (let x = node; x;) {
		if (x instanceof Text) {
			const nv = x.nodeValue;
			if (nv.includes("${") && nv.includes("}")) {
				const ii2 = [...ii];
				x.nodeValue = "";
				ff.push(n => {
					const n2 = findNode(n, ii2);
					return y => {
						const z = nv.replace(expressionRegex, (_, ex) => evaluate(ex, y) ?? "");
						if (z !== n2.nodeValue)
							n2.nodeValue = z;
					};
				});
			}
		} else if (x instanceof Comment) {
			if (x.nodeValue.startsWith("${") && x.nodeValue.endsWith("}")) {
				const ii2 = [...ii];
				const ex = x.nodeValue.substring(2, x.nodeValue.length - 1);
				x.nodeValue = "";
				ff.push(n => {
					const n2 = findNode(n, ii2);
					return y => {
						const z = evaluate(ex, y);
						if (n2.insertedNodesLength) {
							for (let i = n2.insertedNodesLength; i > 0; i--) {
								if (!n2.nextSibling)
									debugger;
								n2.nextSibling.remove();
							}
							n2.insertedNodesLength = 0;
						}
						if (z == null)
							return;
						const zz = Array.isArray(z) ? z : [z];
						zz.forEach(n3 => {
							if (n3 instanceof DocumentFragment && !n3.firstChild && n3.originalChildNodes)
								n3.append(...n3.originalChildNodes);
						});
						const ns = n2.nextSibling;
						if (!n2.parentNode)
							debugger;
						const l1 = n2.parentNode.childNodes.length;
						zz.forEach(n3 => {
							if (typeof n3 === "string")
								// n3 = new Text(n3);
								throw new Error(n3);
							if (n3 instanceof DocumentFragment)
								n3.originalChildNodes ??= [...n3.childNodes];
							n2.parentNode.insertBefore(n3, ns);
						});
						const l2 = n2.parentNode.childNodes.length;
						n2.insertedNodesLength = l2 - l1;
						if (n2.previousSibling?.textContent === "Foo Bar")
							debugger;
					};
				});
			}
		} else if (x instanceof Element && x.hasAttributes()) {
			let i = 0;
			for (const a of x.attributes) {
				const v = a.value;
				if (v.includes("${") && v.includes("}")) {
					const ii2 = [...ii, i];
					a.value = "";
					const s = v.startsWith("${") && v.indexOf("}") === v.length - 1;
					ff.push(n => {
						const a2 = findNode(n, ii2, true);
						const oe = a2.ownerElement;
						return y => {
							let z;
							const v2 = v.replace(expressionRegex, (_, ex) => {
								z = evaluate(ex, y);
								return z ?? "";
							});
							if (!s)
								;
							else if (z === undefined || z === null || z === false)
								a2.ownerElement?.removeAttributeNode(a2);
							else if (!a2.ownerElement)
								oe.setAttributeNode(a2);
							if (v2 === a2.value)
								return;
							a2.value = v2;
						};
					});
				}
				i++;
			}
		}

		if (x.firstChild) {
			x = x.firstChild;
			ii.push(0);
		} else
			do
				if (x === node)
					x = null;
				else if (x.nextSibling) {
					x = x.nextSibling;
					ii[ii.length - 1]++;
					break;
				} else {
					x = x.parentNode;
					ii.pop();
				}
			while (x);
	}
	return () => {
		const n = node.cloneNode(true);
		const ff2 = ff.map(x => x(n));
		return x => {
			ff2.forEach(y => y(x));
			return n;
		};
	};
};
