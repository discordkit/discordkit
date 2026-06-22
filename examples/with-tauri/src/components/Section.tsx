import { Disclosure, DisclosurePanel, Button } from "react-aria-components";
import { ChevronDown } from "lucide-react";
import { FriendEntry } from "./FriendEntry.js";
import type { FriendsSection } from "../sections.js";
import type { StudioOptions } from "../studio.js";

/**
 * One collapsible friends-list section (Figma "Section" = "Header" + "Entry"s).
 * The header is the disclosure trigger: `Label · count` + a chevron that rotates
 * when expanded. Built on react-aria's `Disclosure` so keyboard + screen-reader
 * collapse behavior is correct for free.
 */
export const Section = ({
  section,
  options
}: {
  section: FriendsSection;
  options: StudioOptions;
}): React.JSX.Element => (
  <Disclosure defaultExpanded className="overflow-hidden rounded-module">
    <Button
      slot="trigger"
      className="group flex w-full items-center gap-2 bg-section px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <ChevronDown
        size={16}
        className="text-text-muted transition-transform group-aria-[expanded=false]:-rotate-90"
        aria-hidden="true"
      />
      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {section.label}
      </span>
      <span className="text-xs font-medium tabular-nums text-text-subtle">
        · {section.members.length}
      </span>
    </Button>
    <DisclosurePanel>
      <div className="flex flex-col gap-0.5 p-1">
        {section.members.map((relationship) => (
          <FriendEntry
            key={String(relationship.userId)}
            relationship={relationship}
            // The Discord badge marks online-elsewhere friends as reachable via
            // Discord; per spec it doesn't appear on the in-game section.
            showBadge={options.showDiscordBadge && section.key === `elsewhere`}
            density={options.density}
          />
        ))}
        {section.members.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-text-subtle">
            No friends here right now.
          </p>
        ) : null}
      </div>
    </DisclosurePanel>
  </Disclosure>
);
