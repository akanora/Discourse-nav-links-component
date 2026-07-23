import { acceptance, exists } from "discourse/tests/helpers/qunit-helpers";
import { visit } from "@ember/test-helpers";
import { test } from "qunit";

acceptance("Custom Top Navigation Links | Topic Counts", function (needs) {
  needs.user();

  let originalNavLinks;
  let originalShowCounts;

  needs.hooks.beforeEach(function () {
    originalNavLinks = settings.nav_links;
    originalShowCounts = settings.Show_counts;

    settings.nav_links = [
      { display_name: "New Topics", title: "new topics", url: "/new" },
      { display_name: "Unread Topics", title: "unread topics", url: "/unread" },
    ];
    settings.Show_counts = true;
  });

  needs.hooks.afterEach(function () {
    settings.nav_links = originalNavLinks;
    settings.Show_counts = originalShowCounts;
  });

  test("shows new and unread counts in navigation items", async function (assert) {
    const topicTrackingState = this.owner.lookup(
      "service:topic-tracking-state"
    );
    topicTrackingState.countNew = () => 42;
    topicTrackingState.countUnread = () => 17;

    await visit("/latest");

    assert.ok(
      exists(".nav-item_custom_new-topics"),
      "custom navigation item for new topics is rendered"
    );
    assert
      .dom(".nav-item_custom_new-topics a")
      .hasText("New Topics (42)", "it shows the custom new topics count");

    assert.ok(
      exists(".nav-item_custom_unread-topics"),
      "custom navigation item for unread topics is rendered"
    );
    assert
      .dom(".nav-item_custom_unread-topics a")
      .hasText("Unread Topics (17)", "it shows the custom unread topics count");
  });
});
