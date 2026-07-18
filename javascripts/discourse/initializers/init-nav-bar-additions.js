import { withPluginApi } from "discourse/lib/plugin-api";

// Built-in Discourse filter routes that have associated topic counts
const COUNTED_FILTERS = {
  "/new": "new",
  "/unread": "unread",
};

function getCountForFilter(topicTrackingState, filterType) {
  if (!topicTrackingState) {
    return 0;
  }

  if (filterType === "new") {
    return (
      topicTrackingState.countNew?.() ??
      topicTrackingState.newCount ??
      0
    );
  }

  if (filterType === "unread") {
    return (
      topicTrackingState.countUnread?.() ??
      topicTrackingState.unreadCount ??
      0
    );
  }

  return 0;
}

export default {
  name: "nav-links-component",

  initialize() {
    withPluginApi((api) => {
      const topicTrackingState = api.container.lookup(
        "service:topic-tracking-state"
      );

      for (const {
        display_name: displayName,
        title,
        url,
      } of settings.nav_links) {
        const filterType = COUNTED_FILTERS[url];
        const itemConfig = {
          name: `custom_${displayName.replace(/\s+/g, "-").toLowerCase()}`,
          title,
          href: url,
          forceActive: (category, args, router) =>
            router.currentURL?.split("?")[0] === url,
        };

        if (settings.Show_counts && filterType && topicTrackingState) {
          // Use a function for displayName so Discourse re-evaluates it
          // reactively, picking up count changes from TopicTrackingState
          itemConfig.displayName = () => {
            const count = getCountForFilter(topicTrackingState, filterType);
            return count > 0 ? `${displayName} (${count})` : displayName;
          };
        } else {
          itemConfig.displayName = displayName;
        }

        api.addNavigationBarItem(itemConfig);
      }
    });
  },
};
