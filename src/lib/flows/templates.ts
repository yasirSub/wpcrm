/**
 * Starter flow templates.
 *
 * Three pre-canned flows users can clone with one click instead of
 * building from scratch. Each template is a plain JS object describing
 * the same shape `/api/flows` PUT accepts — name, trigger config,
 * entry_node_id, fallback_policy, nodes[] — keyed by a stable
 * `slug`.
 *
 * The clone path (`/api/flows` POST with `template_slug`) creates a
 * NEW flow_row + flow_nodes rows for the user. `node_key`s are kept
 * verbatim (they're stable strings, not UUIDs, so cloning never
 * needs to rewrite edge references).
 *
 * Choosing a single static module over a DB-backed gallery for v1
 * because: (a) the set is small and changes with code releases, not
 * data; (b) keeps templates portable across self-hosted instances
 * without migrations; (c) editing in source is the lowest-friction
 * way to add the next template.
 */

import type {
  CollectInputNodeConfig,
  ConditionNodeConfig,
  HandoffNodeConfig,
  KeywordTriggerConfig,
  SendButtonsNodeConfig,
  SendListNodeConfig,
  SendMessageNodeConfig,
  StartNodeConfig,
} from "./types";

export type FlowTemplateNodeType =
  | "start"
  | "send_message"
  | "send_buttons"
  | "send_list"
  | "collect_input"
  | "condition"
  | "set_tag"
  | "handoff"
  | "end";

export interface FlowTemplateNode {
  node_key: string;
  node_type: FlowTemplateNodeType;
  config:
    | StartNodeConfig
    | SendMessageNodeConfig
    | SendButtonsNodeConfig
    | SendListNodeConfig
    | CollectInputNodeConfig
    | ConditionNodeConfig
    | HandoffNodeConfig
    | Record<string, unknown>;
}

export interface FlowTemplate {
  slug: string;
  name: string;
  description: string;
  /** Used by the gallery to surface a relevant icon. lucide-react name. */
  icon: "MessageSquare" | "HelpCircle" | "UserPlus";
  trigger_type: "keyword" | "first_inbound_message" | "manual";
  trigger_config: KeywordTriggerConfig | Record<string, unknown>;
  entry_node_id: string;
  nodes: FlowTemplateNode[];
}

// ============================================================
// 1. Welcome menu — the example from the owner's brief
// ============================================================
const WELCOME_MENU: FlowTemplate = {
  slug: "welcome_menu",
  name: "Welcome menu",
  description:
    "Greet customers who type a keyword and route them to the right agent based on whether they're new or existing.",
  icon: "MessageSquare",
  trigger_type: "keyword",
  trigger_config: { keywords: ["support", "help", "hi"], match_type: "contains" },
  entry_node_id: "start",
  nodes: [
    {
      node_key: "start",
      node_type: "start",
      config: { next_node_key: "welcome" },
    },
    {
      node_key: "welcome",
      node_type: "send_buttons",
      config: {
        text: "Hi! 👋 Welcome to support. Are you an existing customer or new here?",
        footer_text: "Tap a button below to continue.",
        buttons: [
          {
            reply_id: "existing",
            title: "Existing customer",
            next_node_key: "existing_handoff",
          },
          {
            reply_id: "new",
            title: "New customer",
            next_node_key: "new_handoff",
          },
        ],
      } as SendButtonsNodeConfig,
    },
    {
      node_key: "existing_handoff",
      node_type: "handoff",
      config: {
        note: "Existing customer needs assistance — please check account history before replying.",
      } as HandoffNodeConfig,
    },
    {
      node_key: "new_handoff",
      node_type: "handoff",
      config: {
        note: "New customer — share pricing + onboarding link.",
      } as HandoffNodeConfig,
    },
  ],
};

// ============================================================
// 2. FAQ bot — list-message answers, fully automated
// ============================================================
const FAQ_BOT: FlowTemplate = {
  slug: "faq_bot",
  name: "FAQ bot",
  description:
    "Answer common questions automatically. Customer picks a topic from a list; the bot replies with the answer and ends.",
  icon: "HelpCircle",
  trigger_type: "keyword",
  trigger_config: {
    keywords: ["faq", "question", "info"],
    match_type: "contains",
  },
  entry_node_id: "start",
  nodes: [
    {
      node_key: "start",
      node_type: "start",
      config: { next_node_key: "topics" },
    },
    {
      node_key: "topics",
      node_type: "send_list",
      config: {
        text: "What can I help you with?",
        button_label: "View topics",
        sections: [
          {
            title: "Common questions",
            rows: [
              {
                reply_id: "hours",
                title: "Opening hours",
                next_node_key: "answer_hours",
              },
              {
                reply_id: "pricing",
                title: "Pricing",
                next_node_key: "answer_pricing",
              },
              {
                reply_id: "refunds",
                title: "Refund policy",
                next_node_key: "answer_refunds",
              },
            ],
          },
          {
            title: "Other",
            rows: [
              {
                reply_id: "human",
                title: "Talk to a human",
                next_node_key: "human_handoff",
              },
            ],
          },
        ],
      } as SendListNodeConfig,
    },
    {
      node_key: "answer_hours",
      node_type: "send_message",
      config: {
        text: "We're open Mon–Fri, 9am–6pm local time. Weekend support is limited to urgent issues.",
        next_node_key: "end",
      } as SendMessageNodeConfig,
    },
    {
      node_key: "answer_pricing",
      node_type: "send_message",
      config: {
        text: "Our pricing starts at $9/mo. Visit https://example.com/pricing for the full breakdown.",
        next_node_key: "end",
      } as SendMessageNodeConfig,
    },
    {
      node_key: "answer_refunds",
      node_type: "send_message",
      config: {
        text: "Refunds are honored within 30 days of purchase. Reply with your order number and we'll process it.",
        next_node_key: "end",
      } as SendMessageNodeConfig,
    },
    {
      node_key: "human_handoff",
      node_type: "handoff",
      config: {
        note: "Customer asked to talk to a human from the FAQ bot.",
      } as HandoffNodeConfig,
    },
    {
      node_key: "end",
      node_type: "end",
      config: {},
    },
  ],
};

// ============================================================
// 3. Lead capture — collect_input chain, ends in a handoff
// ============================================================
const LEAD_CAPTURE: FlowTemplate = {
  slug: "lead_capture",
  name: "Lead capture",
  description:
    "Greet first-time inbounds, capture name + email + company, then hand off to sales with the answers in the note.",
  icon: "UserPlus",
  trigger_type: "first_inbound_message",
  trigger_config: {},
  entry_node_id: "start",
  nodes: [
    {
      node_key: "start",
      node_type: "start",
      config: { next_node_key: "intro" },
    },
    {
      node_key: "intro",
      node_type: "send_message",
      config: {
        text: "Welcome! 👋 I'll ask a few quick questions so we can get you to the right person.",
        next_node_key: "ask_name",
      } as SendMessageNodeConfig,
    },
    {
      node_key: "ask_name",
      node_type: "collect_input",
      config: {
        prompt_text: "What's your name?",
        var_key: "name",
        next_node_key: "ask_email",
      } as CollectInputNodeConfig,
    },
    {
      node_key: "ask_email",
      node_type: "collect_input",
      config: {
        prompt_text: "Thanks {{vars.name}}! What's your work email?",
        var_key: "email",
        next_node_key: "ask_company",
      } as CollectInputNodeConfig,
    },
    {
      node_key: "ask_company",
      node_type: "collect_input",
      config: {
        prompt_text: "Almost done — what's your company name?",
        var_key: "company",
        next_node_key: "handoff",
      } as CollectInputNodeConfig,
    },
    {
      node_key: "handoff",
      node_type: "handoff",
      config: {
        note: "New lead — name={{vars.name}}, email={{vars.email}}, company={{vars.company}}.",
      } as HandoffNodeConfig,
    },
  ],
};

// ============================================================
// 4. Realtor One Assistant — product menu for the main app
// ============================================================
// ============================================================
// 4. Realtor One — shared menu nodes (first inbound + keyword menu)
// ============================================================
const REALTORONE_MENU_NODES: FlowTemplate["nodes"] = [
  {
    node_key: "start",
    node_type: "start",
    config: { next_node_key: "menu" },
  },
  {
    node_key: "menu",
    node_type: "send_list",
    config: {
      text: "Welcome to Realtor One. How can we help?",
      button_label: "View options",
      footer_text: "Or reply: pricing · account · menu",
      sections: [
        {
          title: "Explore",
          rows: [
            {
              reply_id: "ro_plans",
              title: "Plans & pricing",
              description: "AED plans and subscribe link",
              next_node_key: "plans",
            },
            {
              reply_id: "ro_included",
              title: "What's included",
              description: "Scripts, CRM, labs, habits",
              next_node_key: "included",
            },
            {
              reply_id: "ro_account_hint",
              title: "My account",
              description: "Days left / subscription status",
              next_node_key: "account_hint",
            },
            {
              reply_id: "ro_human",
              title: "Talk to human",
              description: "Message our team",
              next_node_key: "human",
            },
          ],
        },
      ],
    } as SendListNodeConfig,
  },
  {
    node_key: "plans",
    node_type: "send_message",
    config: {
      text:
        "Realtor One plans (AED):\n\n• Rainmaker — monthly coaching OS for serious agents\n• Titan — higher tier with more live labs access\n\nReply *pricing* for live AED amounts from our app, or open https://aanantbishthealing.com to subscribe.\n\nReply *menu* anytime.",
      next_node_key: "end",
    } as SendMessageNodeConfig,
  },
  {
    node_key: "included",
    node_type: "send_message",
    config: {
      text:
        "What's inside Realtor One:\n\n• Daily mindset + habits (streaks, focus)\n• Pipeline / CRM prompts\n• Copy-paste scripts for silent buyers & objections\n• Live labs + skill training\n• One system instead of scattered tools\n\nReply *pricing* for plans, or *account* for your status.",
      next_node_key: "end",
    } as SendMessageNodeConfig,
  },
  {
    node_key: "account_hint",
    node_type: "send_message",
    config: {
      text:
        "To see your plan and days left, reply with the word *account* (must be the WhatsApp number linked to your Realtor One app).\n\nReply *pricing* for plans.",
      next_node_key: "end",
    } as SendMessageNodeConfig,
  },
  {
    node_key: "human",
    node_type: "handoff",
    config: {
      note: "Customer asked to talk to a human from Realtor One Assistant.",
    } as HandoffNodeConfig,
  },
  {
    node_key: "end",
    node_type: "end",
    config: {},
  },
];

const REALTORONE_ASSISTANT: FlowTemplate = {
  slug: "realtorone_assistant",
  name: "Realtor One Assistant",
  description:
    "Company-style WhatsApp menu: plans, what's included, and human handoff. Live account/pricing replies use Laravel keyword automations.",
  icon: "MessageSquare",
  trigger_type: "first_inbound_message",
  trigger_config: {},
  entry_node_id: "start",
  nodes: REALTORONE_MENU_NODES,
};

/** Same tap-menu for returning chats that say hi / menu / help. */
const REALTORONE_MENU: FlowTemplate = {
  slug: "realtorone_menu",
  name: "Realtor One Menu",
  description:
    "Interactive WhatsApp list menu when someone says hi, menu, or help (returning contacts).",
  icon: "List",
  trigger_type: "keyword",
  trigger_config: {
    keywords: ["hi", "hello", "hey", "menu", "help", "options"],
    match_type: "word",
  },
  entry_node_id: "start",
  nodes: REALTORONE_MENU_NODES,
};

// ============================================================
// Registry
// ============================================================

const TEMPLATES: Record<string, FlowTemplate> = {
  welcome_menu: WELCOME_MENU,
  faq_bot: FAQ_BOT,
  lead_capture: LEAD_CAPTURE,
  realtorone_assistant: REALTORONE_ASSISTANT,
  realtorone_menu: REALTORONE_MENU,
};

export function getFlowTemplate(slug: string): FlowTemplate | null {
  return TEMPLATES[slug] ?? null;
}

export function listFlowTemplates(): FlowTemplate[] {
  return Object.values(TEMPLATES);
}
