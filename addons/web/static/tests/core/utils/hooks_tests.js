/** @odoo-module **/

import { uiService } from "@web/core/ui/ui_service";
import { useAutofocus, useBus, useListener, useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { makeTestEnv } from "@web/../tests/helpers/mock_env";
import { click, destroy, getFixture, mount, nextTick } from "@web/../tests/helpers/utils";
import { LegacyComponent } from "@web/legacy/legacy_component";

const { Component, onMounted, xml } = owl;
const serviceRegistry = registry.category("services");

QUnit.module("utils", () => {
    QUnit.module("Hooks", () => {
        QUnit.module("useAutofocus");

        QUnit.test("useAutofocus: simple usecase", async function (assert) {
            class MyComponent extends Component {
                setup() {
                    this.inputRef = useAutofocus();
                }
            }
            MyComponent.template = xml`
                <span>
                    <input type="text" t-ref="autofocus" />
                </span>
            `;

            registry.category("services").add("ui", uiService);

            const env = await makeTestEnv();
            const target = getFixture();
            const comp = await mount(MyComponent, target, { env });
            await nextTick();

            assert.strictEqual(document.activeElement, comp.inputRef.el);

            comp.render();
            await nextTick();
            assert.strictEqual(document.activeElement, comp.inputRef.el);
        });

        QUnit.test("useAutofocus: conditional autofocus", async function (assert) {
            class MyComponent extends Component {
                setup() {
                    this.inputRef = useAutofocus();
                    this.showInput = true;
                }
            }
            MyComponent.template = xml`
                <span>
                    <input t-if="showInput" type="text" t-ref="autofocus" />
                </span>
            `;

            registry.category("services").add("ui", uiService);

            const env = await makeTestEnv();
            const target = getFixture();
            const comp = await mount(MyComponent, target, { env });
            await nextTick();

            assert.strictEqual(document.activeElement, comp.inputRef.el);

            comp.showInput = false;
            comp.render();
            await nextTick();
            assert.notStrictEqual(document.activeElement, comp.inputRef.el);

            comp.showInput = true;
            comp.render();
            await nextTick();
            assert.strictEqual(document.activeElement, comp.inputRef.el);
        });

        QUnit.test("useAutofocus returns also a ref when isSmall is true", async function (assert) {
            assert.expect(2);
            class MyComponent extends Component {
                setup() {
                    this.inputRef = useAutofocus();
                    assert.ok(this.env.isSmall);
                    onMounted(() => {
                        assert.ok(this.inputRef.el);
                    });
                }
            }
            MyComponent.template = xml`
                <span>
                    <input type="text" t-ref="autofocus" />
                </span>
            `;

            const fakeUIService = {
                start(env) {
                    let ui = {};
                    Object.defineProperty(env, "isSmall", {
                        get() {
                            return true;
                        },
                    });

                    return ui;
                },
            };

            registry.category("services").add("ui", fakeUIService);

            const env = await makeTestEnv();
            const target = getFixture();
            await mount(MyComponent, target, { env });
        });

        QUnit.module("useBus");

        QUnit.test("useBus hook: simple usecase", async function (assert) {
            class MyComponent extends Component {
                setup() {
                    useBus(this.env.bus, "test-event", this.myCallback);
                }
                myCallback() {
                    assert.step("callback");
                }
            }
            MyComponent.template = xml`<div/>`;

            const env = await makeTestEnv();
            const target = getFixture();
            const comp = await mount(MyComponent, target, { env });
            env.bus.trigger("test-event");
            await nextTick();
            assert.verifySteps(["callback"]);

            destroy(comp);
            env.bus.trigger("test-event");
            await nextTick();
            assert.verifySteps([]);
        });

        QUnit.module("useListener");

        QUnit.test("useListener: simple usecase", async function (assert) {
            class MyComponent extends LegacyComponent {
                setup() {
                    useListener("click", () => assert.step("click"));
                }
            }
            MyComponent.template = xml`<button class="root">Click Me</button>`;

            const env = await makeTestEnv();
            const target = getFixture();
            await mount(MyComponent, target, { env });

            await click(target.querySelector(".root"));
            assert.verifySteps(["click"]);
        });

        QUnit.test("useListener: event delegation", async function (assert) {
            class MyComponent extends LegacyComponent {
                setup() {
                    this.flag = true;
                    useListener("click", "button", () => assert.step("click"));
                }
            }
            MyComponent.template = xml`
                <div class="root">
                    <button t-if="flag">Click Here</button>
                    <button t-else="">
                        <span>or Here</span>
                    </button>
                </div>`;

            const env = await makeTestEnv();
            const target = getFixture();
            const comp = await mount(MyComponent, target, { env });

            await click(target.querySelector(".root"));
            assert.verifySteps([]);
            await click(target.querySelector("button"));
            assert.verifySteps(["click"]);

            comp.flag = false;
            comp.render();
            await nextTick();
            await click(target.querySelector("button span"));
            assert.verifySteps(["click"]);
        });

        QUnit.test("useListener: event delegation with capture option", async function (assert) {
            class MyComponent extends LegacyComponent {
                setup() {
                    this.flag = false;
                    useListener("click", "button", () => assert.step("click"), { capture: true });
                }
            }
            MyComponent.template = xml`
                <div class="root">
                    <button t-if="flag">Click Here</button>
                    <button t-else="">
                        <span>or Here</span>
                    </button>
                </div>`;

            const env = await makeTestEnv();
            const target = getFixture();
            const comp = await mount(MyComponent, target, { env });

            await click(target.querySelector(".root"));
            assert.verifySteps([]);
            await click(target.querySelector("button"));
            assert.verifySteps(["click"]);

            comp.flag = false;
            await comp.render();
            await click(target.querySelector("button span"));
            assert.verifySteps(["click"]);
        });

        QUnit.module("useService");

        QUnit.test("useService: unavailable service", async function (assert) {
            class MyComponent extends Component {
                setup() {
                    useService("toy_service");
                }
            }
            MyComponent.template = xml`<div/>`;

            const env = await makeTestEnv();
            const target = getFixture();
            try {
                await mount(MyComponent, target, { env });
            } catch (e) {
                assert.strictEqual(e.message, "Service toy_service is not available");
            }
        });

        QUnit.test("useService: service that returns null", async function (assert) {
            class MyComponent extends Component {
                setup() {
                    this.toyService = useService("toy_service");
                }
            }
            MyComponent.template = xml`<div/>`;

            serviceRegistry.add("toy_service", {
                name: "toy_service",
                start: () => {
                    return null;
                },
            });

            const env = await makeTestEnv();
            const target = getFixture();

            const comp = await mount(MyComponent, target, { env });
            assert.strictEqual(comp.toyService, null);
        });
    });
});
