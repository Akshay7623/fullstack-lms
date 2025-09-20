import {
  Add,
  Link1,
  KyberNetwork,
  Calendar1,
  Kanban,
  Profile2User,
  Bill,
  UserSquare,
  Category,
  Book,
  Setting
} from "iconsax-react";

const icons = {
  applications: KyberNetwork,
  calendar: Calendar1,
  kanban: Kanban,
  customer: Profile2User,
  invoice: Bill,
  profile: UserSquare,
  add: Add,
  link: Link1,
  batch: Category,
  trainers: Profile2User,
  course:Book,
  settings: Setting
};

const applications = {
  id: "group-applications",
  title: "applications",
  icon: icons.applications,
  type: "group",
  children: [
    {
      id: "transactions",
      title: "transactions",
      type: "collapse",
      icon: icons.invoice,
      breadcrumbs: false,
      children: [
        {
          id: "receipt",
          title: "receipt",
          type: "item",
          url: "/transactions/receipt",
          breadcrumbs: false,
        },
        {
          id: "latest-transaction",
          title: "latest-transaction",
          type: "item",
          url: "/transactions/latest-transaction",
          breadcrumbs: false,
        },
      ],
    },
    {
      id: "courses",
      title: "courses",
      type: "item",
      icon: icons.course,
      breadcrumbs: false,
      url: "/courses",
    },
    {
      id: "batches",
      title: "batches",
      type: "item",
      icon: icons.batch,
      breadcrumbs: false,
      url: "/batches/active",
    },
    {
      id: "trainers",
      title: "trainers",
      type: "collapse",
      icon: icons.trainers,
      breadcrumbs: false,
      children: [
        {
          id: "trainers",
          title: "trainers",
          type: "item",
          url: "/trainers/list",
          breadcrumbs: false,
        },
        {
          id: "trainer-payments",
          title: "trainer-payments",
          type: "item",
          url: "/trainers/trainer-payments",
          breadcrumbs: false,
        },
      ],
    },

    {
      id: "settings",
      title: "settings",
      type: "item",
      icon: icons.settings,
      breadcrumbs: false,
      url: "/settings",
    },
  ],
};

export default applications;