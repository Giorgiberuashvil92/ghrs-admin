import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Home",
            url: "/",
          },
        ],
      },
      {
        title: "Rehabilitation",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Categories",
            url: "/pages/rehabilitation/categories",
          },
          {
            title: "Exercises",
            url: "/pages/rehabilitation/exercises",
          },
          {
            title: "Videos",
            url: "/pages/videos",
          },
        ],
      },
      {
        title: "Professional Development",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Courses",
            url: "/pages/courses",
          },
        ],
      },
      {
        title: "Blog",
        icon: Icons.PieChart,
        items: [
          {
            title: "Articles",
            url: "/pages/blog",
          },
        ],
      },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Settings",
        icon: Icons.Alphabet,
        items: [
          {
            title: "General",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
];
