import { HomeTrendUp } from "iconsax-react";

const icons = {
  dashboard: HomeTrendUp,
};

export function MenuFromAPI() {

  const menu = {
    id: "group-dashboard",
    title: "dashboard",
    type: "group",
    icon: "dashboard",
    children: [
      {
        id: "dashboard",
        title: "dashboard",
        type: "collapse",
        icon: icons.dashboard,
        children: [
          {
            id: "home",
            title: "home",
            type: "item",
            url: "/dashboard/home",
            breadcrumbs: false,
          },
          {
            id: "analytics",
            title: "analytics",
            type: "item",
            url: "/dashboard/analytics",
            breadcrumbs: false,
          },
          {
            id: "finance",
            title: "finance",
            type: "item",
            url: "/dashboard/finance",
            breadcrumbs: false,
          },
        ],
      },
    ]
  };

  const subChildrenList = (children) => {
    return children?.map((subList) => {
      return fillItem(subList);
    });
  };

  const itemList = (subList) => {
    let list = fillItem(subList);

    if (subList.type === "collapse") {
      list.children = subChildrenList(subList.children);
    }
    return list;
  };

  const childrenList = menu?.children?.map((subList) => {
    return itemList(subList);
  });

  let menuList = fillItem(menu, childrenList);
  return menuList;
}

function fillItem(item, children) {
  return {
    ...item,
    title: item?.title,
    icon: icons[item?.icon],
    ...(children && { children }),
  };
}
